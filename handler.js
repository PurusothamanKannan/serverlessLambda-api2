"use strict";

const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();

module.exports.curdOps = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json"
  };
 let tableName= "reviewRequest-serverless"
  try {
    switch (event.routeKey) {
      case "POST /items":
        await dynamo
          .createTable({
            TableName: tableName,
            KeySchema: [
            { AttributeName: "id", KeyType: "HASH"},  //Partition key
            { AttributeName: "status", KeyType: "RANGE" }  //Sort key
            ],
            AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "status", AttributeType: "S" }
           ]
          })
          .promise();
        
        break;
      case "DELETE /items/{id}":
        await dynamo
          .delete({
            TableName: tableName,
            Key: {
              id: event.pathParameters.id
            }
          })
          .promise();
        body = `Deleted item ${event.pathParameters.id}`;
        break;
      
      case "GET /items":
        body = await dynamo.scan({ TableName: tableName}).promise();
        break;
      case "PUT /items":
        let requestJSON = JSON.parse(event.body);
        await dynamo
          .put({
            TableName: tableName,
            Item: {
              id: requestJSON.id,
              status: requestJSON.status
              
            }
          })
          .promise();
        body = `Put item ${requestJSON.id}`;
        break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers
  };
};

