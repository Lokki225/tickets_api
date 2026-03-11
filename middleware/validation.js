const Joi = require('joi');

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property]);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req[property] = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  // User validation schemas
  userRegister: Joi.object({
    nom: Joi.string().min(2).max(191).required(),
    email: Joi.string().email().required(),
    motDePasse: Joi.string().min(6).required(),
    roleId: Joi.number().integer().positive().required()
  }),

  userLogin: Joi.object({
    email: Joi.string().email().required(),
    motDePasse: Joi.string().required()
  }),

  userUpdate: Joi.object({
    nom: Joi.string().min(2).max(191),
    email: Joi.string().email(),
    roleId: Joi.number().integer().positive()
  }).min(1),

  // Event validation schemas
  eventCreate: Joi.object({
    titre: Joi.string().min(2).max(191).required(),
    description: Joi.string().max(1000).optional(),
    dateDebut: Joi.date().iso().required(),
    dateFin: Joi.date().iso().greater(Joi.ref('dateDebut')).required(),
    maxBillets: Joi.number().integer().positive().required(),
    organisateurId: Joi.number().integer().positive().required(),
    categorieId: Joi.number().integer().positive().required(),
    lieuId: Joi.number().integer().positive().required(),
    statutId: Joi.number().integer().positive().required()
  }),

  eventUpdate: Joi.object({
    titre: Joi.string().min(2).max(191),
    description: Joi.string().max(1000),
    dateDebut: Joi.date().iso(),
    dateFin: Joi.date().iso(),
    maxBillets: Joi.number().integer().positive(),
    categorieId: Joi.number().integer().positive(),
    lieuId: Joi.number().integer().positive(),
    statutId: Joi.number().integer().positive()
  }).min(1),

  // Ticket validation schemas
  ticketCreate: Joi.object({
    nom: Joi.string().min(2).max(191).required(),
    prix: Joi.number().positive().required(),
    quantite: Joi.number().integer().positive().required(),
    evenementId: Joi.number().integer().positive().required(),
    typeId: Joi.number().integer().positive().required()
  }),

  ticketPurchase: Joi.object({
    billetId: Joi.number().integer().positive().required(),
    quantite: Joi.number().integer().positive().max(10).required()
  }),

  // Payment validation schemas
  paymentCreate: Joi.object({
    achatBilletId: Joi.number().integer().positive().required(),
    prestataireId: Joi.number().integer().positive().required(),
    evenementId: Joi.number().integer().positive().required(),
    montant: Joi.number().positive().required(),
    reference: Joi.string().max(191).required()
  }),

  // Message validation schemas
  messageCreate: Joi.object({
    destinataireId: Joi.number().integer().positive().required(),
    contenu: Joi.string().min(1).max(1000).required()
  }),

  // Notification validation schemas
  notificationCreate: Joi.object({
    utilisateurId: Joi.number().integer().positive().required(),
    titre: Joi.string().min(1).max(191).required(),
    message: Joi.string().min(1).max(1000).required()
  }),

  // ID parameter validation
  idParam: Joi.object({
    id: Joi.number().integer().positive().required()
  })
};

module.exports = {
  validate,
  schemas
};
