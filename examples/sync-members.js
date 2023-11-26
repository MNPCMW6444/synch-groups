//


const config = require('config');
const util = require('util');
const axios = require('axios');
const { getProxyHttpAgent } =  require('proxy-http-agent');
const csv = require('async-csv');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const usersUrl = util.format('%s/users', config.api_gateway_url);
const groupsUrl = util.format('%s/groups', config.api_gateway_url);
const organizationsUrl = util.format('%s/organizations', config.api_gateway_url);

const api_gateway_options = {
    headers: {            
        'Authorization': `Bearer ${config.api_gateway_token}`,
        'X-API-Version': '1.0.0'
    }
};

var rootDepartmentId;

async function getShiftDetails() {
    const httpsAgent = getProxyHttpAgent({
        proxy: config.https_proxy,
        rejectUnauthorized: false
    });

    try {
        const response = await axios.post(config.shifts_url, {}, { headers: { 'Authorization': `${config.rambam_token}` }, httpsAgent: httpsAgent, responseEncoding: 'utf8' });        
        
        if (!response.data.success) {
            console.error('Error returned from Rambam API: %s', response.data);
            return null;
        }
        
        const results = await csv.parse(Buffer.from(response.data.data, 'base64'), { bom: true, relax: true, ltrim: true, rtrim: true, relaxColumnCount: true, skip_lines_with_empty_values: true, from_line: 2 , columns: [ 'group_name', 'phone_number', 'display_name', 'department', 'description' ] });
        
        return results;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function getGroupsMap() {
    try {
        const response = await axios.get(groupsUrl, api_gateway_options);
        return Object.fromEntries(response.data.map(e => [e.display_name, e]));
    } catch (error) {
        console.error(error);
    }
}

async function getUsersMap() {
    try {
        const response = await axios.get(usersUrl, api_gateway_options);
        return Object.fromEntries(response.data.map(e => [e.phone_number, e]));
    } catch (error) {
        console.error(error);
    }
}

async function getDepartmentsMap(id) {
    try {
        const departmentsUrl = util.format('%s/%s/departments', organizationsUrl, id);
        const response = await axios.get(departmentsUrl, api_gateway_options);
        rootDepartmentId = response.data[0].department_id;        
        return Object.fromEntries(response.data.map(e => [e.department_name, e.department_id]));
    } catch (error) {
        console.error(error);
    }
}

async function setGroupUsers(group, users) {
    const updateGroupUrl = util.format('%s/%s/members', groupsUrl, group.id);
    console.log('Update group %s with members %s', group.id, users);
    
    try {
        await axios.put(updateGroupUrl, users, api_gateway_options);
    } catch (error) {        
        console.error(error.response.data);
    }
}

async function createUser(orgId, phoneNumber, firstName, lastName, displayName, departmentId) {
    console.log('Creating user. OrgId: %s, phoneNumber: %s, firstName: %s, lastName: %s, display: %s', orgId, phoneNumber, firstName, lastName, displayName);
    
    try {
        const response = await axios.post(usersUrl, {
            "organization_id": orgId,
            "username": phoneNumber,
            "password": "1q2w3e4r",
            "change_password_required": true,
            "first_name": firstName,
            "last_name": lastName,
            "display_name": displayName,
            "phone_number": phoneNumber,
            "department": departmentId,
            "permission": "user",
            "settings_access": "all",
            "priority": 1,
            "active": true,
            "addons": [ "ptt_lock", "chat", "ptv", "map", "global_search" ],
            "contacts": [],
            "cameras": [],
            "radios": [],
            "groups": []
        }, api_gateway_options);

        return response.data.id;
    } catch (error) {
        console.error(error.response.data);
        return null;
    }
}

async function createDepartment(orgId, departmentName, parentDepartmentId) {
    console.log('Creating department. OrgId: %s, name: %s, parentDepartmentId: %s', orgId, departmentName, parentDepartmentId);
    const departmentsUrl = util.format('%s/%s/departments', organizationsUrl, orgId);

    try {
        const response = await axios.post(departmentsUrl, {            
            "display_name": departmentName,
            "parent_department_id": parentDepartmentId
        }, api_gateway_options);

        return response.data.id;
    } catch (error) {
        console.error(error.response.data);
        return null;
    }
}

async function assignUsers(users, group, organizationId) {
    try {
        console.log('Assign the following users to each other: %s, and groups: %s', users, group);
        const assignUsersUrl = util.format('%s/assign', usersUrl);

        await axios.patch(assignUsersUrl, {
            "organization_id": organizationId,
            "from_users": users,
            "to_users": users,
            "groups": [group]
        }, api_gateway_options);
    } catch (error) {
        console.error(error);
    }
}

async function getComplimentaryShiftDetails() {
    var complimentaryShiftDetails = [];

    try {
        const response = await s3.getObject({Bucket: 'rambam-shifts', Key: 'rambam.csv'}).promise();
        const results = await csv.parse(Buffer.from(response.Body, 'base64'), { bom: true, relax: true, ltrim: true, rtrim: true, relaxColumnCount: true, from_line: 2 , columns: [ 'group_name', 'phone_number', 'display_name', 'department', 'description', 'date' ] });
        const currentDate = new Date().toLocaleDateString();
        
        for (const item of results) {
            const date = new Date(item['date'].replace(/(\d+[.])(\d+[.])/, '$2$1'));
            if (date.toLocaleDateString() == currentDate) {
                complimentaryShiftDetails.push({
                    group_name: item['group_name'],
                    phone_number: item['phone_number'],
                    display_name: item['display_name'],
                    department: item['department'],
                    description: item['description']
                  });
            }
        }
    } catch (error) {
        console.error(error);
    }
    
    return complimentaryShiftDetails;
}

exports.handler = async (event) => {
    var shift = await getShiftDetails();    
    
    if (!shift) {
        console.log('Failed to load shift details');
        return {
            status: 500,
            data: JSON.stringify('Failed to get shift details')
        };
    }
    
    const complimentaryShiftDetails =  await getComplimentaryShiftDetails();
    Array.prototype.push.apply(shift, complimentaryShiftDetails);
    
    var groups = await getGroupsMap();
    if (groups == null || groups.size == 0 || Object.keys(groups).length === 0) {
        console.log('There are no groups in that organization. stop execution');
        return;
    }

    var departments = await getDepartmentsMap(Object.values(groups)[0].organization_id);
    if (departments == null || departments.size == 0 || Object.keys(departments).length === 0) {
        console.log('Failed to load departments. stop execution');
        return;
    }

    var users = await getUsersMap();

    console.log('****** Shift Details ******');
    console.log(shift);        

    var groupsToUpdate = new Map();

    for (const item of shift) {
        if (groups[item.group_name] == undefined ) {
            continue;
        }

        var departmentId;
        if (departments[item.department] == undefined) {
            departmentId = await createDepartment(groups[item.group_name].organization_id, item.department, rootDepartmentId);
            departments[item.department] = departmentId;
        } else {
            departmentId = departments[item.department];
        }

        var userId;
        if (users[item.phone_number] == undefined) {
            const orgId = groups[item.group_name].organization_id;
            const splitedName = item.display_name.split(' ');            
            const lastName = splitedName[0];
            const firstName = item.display_name.replace(lastName, '');            
            userId = await createUser(orgId, item.phone_number, firstName, lastName, item.display_name, departmentId);
        } else {
            userId = users[item.phone_number].id;
        }

        if (userId == null) {
            continue;
        }

        if (!groupsToUpdate.has(item.group_name)) {
            groupsToUpdate.set(item.group_name, []);            
        }

        groupsToUpdate.get(item.group_name).push(userId);
    }

    for (var entry of groupsToUpdate.entries()) {
        var key = entry[0];
        var members = entry[1];        

        await setGroupUsers(groups[key], []);
        await assignUsers(members, groups[key].id, groups[key].organization_id);        
    }
};