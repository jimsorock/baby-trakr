'use strict'
module.change_code = 1
require('dotenv').config()
const _ = require('lodash')
const Alexa = require('alexa-app')
const app = new Alexa.app('babytrakr')
const DatabaseHelper = require('./database_helper')()
const WtoN = require('words-to-num')
const moment = require('moment')

app.launch(function (req, res) {
    const prompt = 'Tell me the feeding amount in ounces.'
    res.say(prompt).reprompt(prompt).shouldEndSession(false)
})

app.intent('saveFeedingAmt', {
    'slots': {
        'FEEDINGAMT': 'AMAZON.NUMBER'
    },
    'utterances': ['{1-30|FEEDINGAMT} {|ounces}']
}, feedingAmountHandler)

app.intent('lastFeedingAmt', {
    'utterances': ['{|what} {|was|is} {|the|my} last feeding {|amount}']
}, lastestFeedingHandler)

function feedingAmountHandler(req, res) {
    //get the slot
    const feedingAmt = WtoN.convert(req.slot('FEEDINGAMT'))
    const reprompt = 'Please tell me a feeding amount in ounces.'
    if (_.isNaN(feedingAmt)) {
        const prompt = 'You did not give a proper feeding amount. Please give me a number'
        res.say(prompt).reprompt(reprompt).shouldEndSession(false)
        return true
    } else {
        const userId = req.userId
        return DatabaseHelper.storeFeedingData(userId, feedingAmt)
            .then(data => {
                res.say('Your feeding amount has been saved!')
                return res.shouldEndSession(true).send()
            })
            .fail(function (e) {
                return res.fail(e)
            })
    }
}

function lastestFeedingHandler(req, res) {
    const userId = req.userId
    return DatabaseHelper.readFeedingData(userId)
        .then(data => {
            const timeAgo = moment(data.result.feeding_dt).fromNow()
            res.say(timeAgo + ', the last feeding amount was, ' + data.result.feeding_amt + ' ounces')
            return res.shouldEndSession(true).send()
        })
        .fail(function (e) {
            return res.fail(e)
        })
}


//hack to support custom utterances in utterance expansion string
const utterancesMethod = app.utterances
app.utterances = function () {
    return utterancesMethod().replace(/\{\-\|/g, '{')
}

exports.handler = app.lambda()