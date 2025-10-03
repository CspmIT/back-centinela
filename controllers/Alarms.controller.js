const { 
  listAlarms,
  postAlarm,
  updateAlarm,
  changeStatusAlarm
 } = require('../services/AlarmsService')

const { db } = require('../models')

const getAlarms = async (req, res) => {
    try {
      const Alarms = await listAlarms();
      return res.status(200).json(Alarms)
    } catch (error) {
      if (error.errors) {
        res.status(500).json(error.errors)
      } else {
        res.status(400).json(error.message)
      }
    }
  }

  const addAlarms = async (req, res) => {
    try {
      const newAlarm = await postAlarm(req.body);
      return res.status(200).json(newAlarm)
    } catch (error) {
      if (error.errors) {
        res.status(500).json(error.errors)
      } else {
        res.status(400).json(error.message)
      }
    }
  }

  const editAlarm = async (req, res) => {
    try {
      const { id } = req.params
      const updatedAlarm = await updateAlarm(id, req.body)
      return res.status(200).json(updatedAlarm)
    } catch (error) {
      if (error.errors) {
        res.status(500).json(error.errors)
      } else {
        res.status(400).json(error.message)
      }
    }
  }

  const toggleAlarmStatus = async (req, res) => {
    try {
      const { id } = req.body  
      const { status } = req.body
  
      const updatedAlarm = await changeStatusAlarm(id, status)
      return res.status(200).json(updatedAlarm)
    } catch (error) {
      if (error.errors) {
        res.status(500).json(error.errors)
      } else {
        res.status(400).json(error.message)
      }
    }
  }

  module.exports = {
    getAlarms,
    addAlarms,
    editAlarm,
    toggleAlarmStatus
  }