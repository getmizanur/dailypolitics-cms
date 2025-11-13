const ErrorResponse = require('./util/errorResponse');

class TableGateway {

    constructor(table, dbAdapter) {
        this.tableName = table;
        this.db = dbAdapter;
    }

    getTableName() {
        return this.tableName;
    }

    findById(ID) {
        const params = {
            TableName: this.tableName,
            Key: ID
        };

        return this.db.get(params).promise();
    }

    findBy(criteria){
        const params = {
            TableName: this.tableName
        };

        Object.assign(params, criteria);

        return this.db.scan(params).promise();
    }

    save(data) {
        const params = {
            TableName: this.tableName,
            Item: data
        };

        return this.db.put(params).promise();
    }

    delete(ID) {
        const params = {
            TableName: this.tableName,
            Key: ID
        }

        return this.db.delete(params).promise();
    }

}

module.exports = TableGateway
