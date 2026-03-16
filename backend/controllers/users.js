const bcrypt = require('bcrypt')
const { IsNull, In } = require('typeorm')

const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('UsersController')
const generateJWT = require('../utils/generateJWT')

const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{10,16}/

function isUndefined (value) {
  return value === undefined
}

function isNotValidSting (value) {
  return typeof value !== 'string' || value.trim().length === 0 || value === ''
}

class UsersController {
  static async postSignup (req, res, next) {
    try {
      const { name, email, password } = req.body
      if (isUndefined(name) || isNotValidSting(name) || isUndefined(email) || isNotValidSting(email) || isUndefined(password) || isNotValidSting(password)) {
        logger.warn('欄位未填寫正確')
        res.status(400).json({
          status: 'failed',
          message: '欄位未填寫正確'
        })
        return
      }
      if (!passwordPattern.test(password)) {
        logger.warn('建立使用者錯誤: 密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
        res.status(400).json({
          status: 'failed',
          message: '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
        })
        return
      }
      const userRepository = dataSource.getRepository('User')
      const existingUser = await userRepository.findOne({
        where: { email }
      })

      if (existingUser) {
        logger.warn('建立使用者錯誤: Email 已被使用')
        res.status(409).json({
          status: 'failed',
          message: 'Email 已被使用'
        })
        return
      }
      const salt = await bcrypt.genSalt(10)
      const hashPassword = await bcrypt.hash(password, salt)
      const newUser = userRepository.create({
        name,
        email,
        role: 'USER',
        password: hashPassword
      })
      const savedUser = await userRepository.save(newUser)
      logger.info('新建立的使用者ID:', savedUser.id)
      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: savedUser.id,
            name: savedUser.name
          }
        }
      })
    } catch (error) {
      logger.error('建立使用者錯誤:', error)
      next(error)
    }
  }

  static async postLogin (req, res, next) {
    try {
      const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/
      const { email, password } = req.body
      if (isUndefined(email) || isNotValidSting(email) || isUndefined(password) || isNotValidSting(password)) {
        logger.warn('欄位未填寫正確')
        res.status(400).json({
          status: 'failed',
          message: '欄位未填寫正確'
        })
        return
      }
      if (!passwordPattern.test(password)) {
        logger.warn('密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
        res.status(400).json({
          status: 'failed',
          message: '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
        })
        return
      }
      const userRepository = dataSource.getRepository('User')
      const existingUser = await userRepository.findOne({
        select: ['id', 'name', 'password', 'role'],
        where: { email }
      })

      if (!existingUser) {
        res.status(400).json({
          status: 'failed',
          message: '使用者不存在或密碼輸入錯誤'
        })
        return
      }
      logger.info(`使用者資料: ${JSON.stringify(existingUser)}`)
      const isMatch = await bcrypt.compare(password, existingUser.password)
      if (!isMatch) {
        res.status(400).json({
          status: 'failed',
          message: '使用者不存在或密碼輸入錯誤'
        })
        return
      }
      const token = await generateJWT({
        id: existingUser.id,
        role: existingUser.role
      }, config.get('secret.jwtSecret'), {
        expiresIn: `${config.get('secret.jwtExpiresDay')}`
      })

      res.status(201).json({
        status: 'success',
        data: {
          token,
          user: {
            name: existingUser.name
          }
        }
      })
    } catch (error) {
      logger.error('登入錯誤:', error)
      next(error)
    }
  }

  static async getProfile (req, res, next) {
    try {
      const { id } = req.user
      const userRepository = dataSource.getRepository('User')
      const user = await userRepository.findOne({
        select: ['name', 'email'],
        where: { id }
      })
      res.status(200).json({
        status: 'success',
        data: {
          user
        }
      })
    } catch (error) {
      logger.error('取得使用者資料錯誤:', error)
      next(error)
    }
  }

  static async getCreditPackage (req, res, next) {
    try {
      const { id } = req.user
      const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
      const creditPurchase = await creditPurchaseRepo.find({
        select: {
          purchased_credits: true,
          price_paid: true,
          purchaseAt: true,
          CreditPackage: {
            name: true
          }
        },
        where: {
          user_id: id
        },
        relations: {
          CreditPackage: true
        },
        order: {
          purchaseAt: 'DESC'
        }
      })
      res.status(200).json({
        status: 'success',
        data: creditPurchase.map((item) => {
          return {
            name: item.CreditPackage.name,
            purchased_credits: item.purchased_credits,
            price_paid: parseInt(item.price_paid, 10),
            purchase_at: item.purchaseAt
          }
        })
      })
    } catch (error) {
      logger.error('取得使用者資料錯誤:', error)
      next(error)
    }
  }

  static async putProfile (req, res, next) {
    try {
      const { id } = req.user
      const { name } = req.body
      if (isUndefined(name) || isNotValidSting(name)) {
        logger.warn('欄位未填寫正確')
        res.status(400).json({
          status: 'failed',
          message: '欄位未填寫正確'
        })
        return
      }
      const userRepository = dataSource.getRepository('User')
      const user = await userRepository.findOne({
        select: ['name'],
        where: {
          id
        }
      })
      if (user.name === name) {
        res.status(400).json({
          status: 'failed',
          message: '使用者名稱未變更'
        })
        return
      }
      const updatedResult = await userRepository.update({
        id,
        name: user.name
      }, {
        name
      })
      if (updatedResult.affected === 0) {
        res.status(400).json({
          status: 'failed',
          message: '更新使用者資料失敗'
        })
        return
      }
      const result = await userRepository.findOne({
        select: ['name'],
        where: {
          id
        }
      })
      res.status(200).json({
        status: 'success',
        data: {
          user: result
        }
      })
    } catch (error) {
      logger.error('取得使用者資料錯誤:', error)
      next(error)
    }
  }

  static async putPassword (req, res, next) {
    try {
      const { id } = req.user
      const { password, new_password: newPassword, confirm_new_password: confirmNewPassword } = req.body
      if (isUndefined(password) || isNotValidSting(password) ||
      isUndefined(newPassword) || isNotValidSting(newPassword) ||
      isUndefined(confirmNewPassword) || isNotValidSting(confirmNewPassword)) {
        logger.warn('欄位未填寫正確')
        res.status(400).json({
          status: 'failed',
          message: '欄位未填寫正確'
        })
        return
      }
      if (!passwordPattern.test(password) || !passwordPattern.test(newPassword) || !passwordPattern.test(confirmNewPassword)) {
        logger.warn('密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
        res.status(400).json({
          status: 'failed',
          message: '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
        })
        return
      }
      if (newPassword === password) {
        logger.warn('新密碼不能與舊密碼相同')
        res.status(400).json({
          status: 'failed',
          message: '新密碼不能與舊密碼相同'
        })
        return
      }
      if (newPassword !== confirmNewPassword) {
        logger.warn('新密碼與驗證新密碼不一致')
        res.status(400).json({
          status: 'failed',
          message: '新密碼與驗證新密碼不一致'
        })
        return
      }
      const userRepository = dataSource.getRepository('User')
      const existingUser = await userRepository.findOne({
        select: ['password'],
        where: { id }
      })
      const isMatch = await bcrypt.compare(password, existingUser.password)
      if (!isMatch) {
        res.status(400).json({
          status: 'failed',
          message: '密碼輸入錯誤'
        })
        return
      }
      const salt = await bcrypt.genSalt(10)
      const hashPassword = await bcrypt.hash(newPassword, salt)
      const updatedResult = await userRepository.update({
        id
      }, {
        password: hashPassword
      })
      if (updatedResult.affected === 0) {
        res.status(400).json({
          status: 'failed',
          message: '更新密碼失敗'
        })
        return
      }
      res.status(200).json({
        status: 'success',
        data: null
      })
    } catch (error) {
      logger.error('取得使用者資料錯誤:', error)
      next(error)
    }
  }

  static async getCourseBooking (req, res, next) {
    try {
      const { id } = req.user
      const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
      const courseBookingRepo = dataSource.getRepository('CourseBooking')
      const userCredit = await creditPurchaseRepo.sum('purchased_credits', {
        user_id: id
      })
      const userUsedCredit = await courseBookingRepo.count({
        where: {
          user_id: id,
          cancelledAt: IsNull()
        }
      })
      const courseBookingList = await courseBookingRepo.find({
        select: {
          course_id: true,
          cancelledAt: true,
          Course: {
            name: true,
            start_at: true,
            end_at: true,
            meeting_url: true,
            user_id: true
          }
        },
        where: {
          user_id: id
        },
        order: {
          Course: {
            start_at: 'ASC'
          }
        },
        relations: {
          Course: true
        }
      })
      const coachUserIdMap = {}
      if (courseBookingList.length > 0) {
        courseBookingList.forEach((courseBooking) => {
          coachUserIdMap[courseBooking.Course.user_id] = courseBooking.Course.user_id
        })
        const userRepo = dataSource.getRepository('User')
        const coachUsers = await userRepo.find({
          select: ['id', 'name'],
          where: {
            id: In(Object.values(coachUserIdMap))
          }
        })
        coachUsers.forEach((user) => {
          coachUserIdMap[user.id] = user.name
        })
        logger.debug(`courseBookingList: ${JSON.stringify(courseBookingList)}`)
        logger.debug(`coachUsers: ${JSON.stringify(coachUsers)}`)
      }
      res.status(200).json({
        status: 'success',
        data: {
          credit_remain: userCredit - userUsedCredit,
          credit_usage: userUsedCredit,
          course_booking: courseBookingList.map((courseBooking) => {
            return {
              course_id: courseBooking.course_id,
              name: courseBooking.Course.name,
              start_at: courseBooking.Course.start_at,
              end_at: courseBooking.Course.end_at,
              meeting_url: courseBooking.Course.meeting_url,
              coach_name: coachUserIdMap[courseBooking.Course.user_id],
              cancelled_at: courseBooking.cancelledAt
            }
          })
        }
      })
    } catch (error) {
      logger.error('取得使用者資料錯誤:', error)
      next(error)
    }
  }
}

module.exports = UsersController
