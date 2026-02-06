const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CreditPackageController')

function isUndefined (value) {
  return value === undefined
}

function isNotValidSting (value) {
  return typeof value !== 'string' || value.trim().length === 0 || value === ''
}

function isNotValidInteger (value) {
  return typeof value !== 'number' || value < 0 || value % 1 !== 0
}

class CreditPackageController {
  static async getAll (req, res, next) {
    try {
      const creditPackage = await dataSource.getRepository('CreditPackage').find({
        select: ['id', 'name', 'credit_amount', 'price']
      })
      res.status(200).json({
        status: 'success',
        data: creditPackage,
        total: creditPackage.length
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  static async postCreditPackage (req, res, next) {
    try {
      const { name, credit_amount: creditAmount, price } = req.body
      if (isUndefined(name) || isNotValidSting(name) ||
        isUndefined(creditAmount) || isNotValidInteger(creditAmount) ||
              isUndefined(price) || isNotValidInteger(price)) {
        res.status(400).json({
          status: 'failed',
          message: '欄位未填寫正確'
        })
        return
      }
      const creditPackageRepo = dataSource.getRepository('CreditPackage')
      const existCreditPackage = await creditPackageRepo.find({
        where: {
          name
        }
      })
      if (existCreditPackage.length > 0) {
        res.status(409).json({
          status: 'failed',
          message: '資料重複'
        })
        return
      }
      const newCreditPurchase = await creditPackageRepo.create({
        name,
        credit_amount: creditAmount,
        price
      })
      const result = await creditPackageRepo.save(newCreditPurchase)
      res.status(200).json({
        status: 'success',
        data: result
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  static async postUserBuy (req, res, next) {
    try {
      const { id } = req.user
      const { creditPackageId } = req.params
      const creditPackageRepo = dataSource.getRepository('CreditPackage')
      const creditPackage = await creditPackageRepo.findOne({
        where: {
          id: creditPackageId
        }
      })
      if (!creditPackage) {
        res.status(400).json({
          status: 'failed',
          message: 'ID錯誤'
        })
        return
      }
      const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
      const newPurchase = await creditPurchaseRepo.create({
        user_id: id,
        credit_package_id: creditPackageId,
        purchased_credits: creditPackage.credit_amount,
        price_paid: creditPackage.price,
        purchaseAt: new Date().toISOString()
      })
      await creditPurchaseRepo.save(newPurchase)
      res.status(200).json({
        status: 'success',
        data: null
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  static async delete (req, res, next) {
    try {
      const { creditPackageId } = req.params
      if (isUndefined(creditPackageId) || isNotValidSting(creditPackageId)) {
        res.status(400).json({
          status: 'failed',
          message: '欄位未填寫正確'
        })
        return
      }
      const result = await dataSource.getRepository('CreditPackage').delete(creditPackageId)
      if (result.affected === 0) {
        res.status(400).json({
          status: 'failed',
          message: 'ID錯誤'
        })
        return
      }
      res.status(200).json({
        status: 'success',
        data: result
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }
}
module.exports = CreditPackageController
