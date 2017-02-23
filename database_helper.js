'use strict'
module.change_code = 1
const uuidV1 = require('uuid/v1')
const Dynamite = require('dynamite')
const dbClient = new Dynamite.Client({})
const FEEDING_DATA_TABLE_NAME = 'feeding_datav1'


function DatabaseHelper() {
    return {
        storeFeedingData,
        readFeedingData,
    }

    function storeFeedingData(userId, feedingAmt) {
        return dbClient.newUpdateBuilder(FEEDING_DATA_TABLE_NAME)
            .setHashKey('user_id', userId)
            //.setRangeKey('created_on', new Date().toISOString())
            .enableUpsert()
            .putAttribute('feeding_amt', feedingAmt)
            .putAttribute('feeding_dt', new Date().toISOString())
            .execute()
    }

    function readFeedingData(userId) {
        return dbClient.getItem(FEEDING_DATA_TABLE_NAME)
            .setHashKey('user_id', userId)
            .execute()
    }

}

module.exports = DatabaseHelper