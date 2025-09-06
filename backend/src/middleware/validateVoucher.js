import { body, validationResult } from "express-validator";

// A node package, to validate data(like voucherId, merchant, maxmint... etc) and used as a middleware 

/** 
 * this checks fields of the data and if not followed then return the massage as an error that what is the broken, like if voucherId is not given it would send message that "voucherId is required"
  
 * And in the end if the any of the field fails it would store as a req and then got by 'validationResult(req)' and send as an res
*/
export const validateVoucher = [
  body("voucherId").notEmpty().withMessage("voucherId is required"),
  body("merchant").isEthereumAddress().withMessage("Invalid merchant address"),
  body("maxMint").isNumeric().withMessage("maxMint must be a number"),
  body("expiry").isNumeric().withMessage("expiry must be a number (timestamp)"),
  body("metadataHash").isHexadecimal().withMessage("metadataHash must be hex"),
  body("metadataCID").notEmpty().withMessage("metadataCID is required"),
  body("price").isNumeric().withMessage("price must be a number"),
  body("nonce").isNumeric().withMessage("nonce must be a number"),
  body("signature").isHexadecimal().withMessage("signature must be hex"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// It just validate that the transaction hash after the approval is valid or not and if not send error
export const validateApprove = [
  body("approvedTxHash").isHexadecimal()
  .withMessage("txHash must be a valid transaction hash"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

//Not necessary but It just validate that the notes or reason after the rejection is string or not and if not send error

export const validateReject = [
  body("notes").optional().isString().withMessage("reason must be a string"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
