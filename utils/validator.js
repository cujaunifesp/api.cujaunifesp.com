import Joi from "joi";

import { InternalServerError, ValidationError } from "utils/errors";

export function run(object, keys) {
  try {
    object = JSON.parse(JSON.stringify(object));
  } catch (error) {
    throw new ValidationError({
      message: "Não foi possível interpretar o valor enviado.",
      action: "Verifique se o valor enviado é um JSON válido.",
      errorLocationCode: "MODEL:VALIDATOR:ERROR_PARSING_JSON",
    });
  }

  let finalSchema = Joi.object().required().min(1).messages({
    "object.base": `Body enviado deve ser do tipo Object.`,
    "object.min": `O objeto enviado deve ter no mínimo uma chave.`,
    "object.unknown": `O objeto enviado possui valores não permitidos`,
  });

  for (const keyName in keys) {
    const keyOptions = keys[keyName];

    if (!keyOptions.type) {
      throw new InternalServerError({
        internalErrorMessage: `Nenhum type definido para o campo ${keyName}`,
      });
    }

    const schema = hydrateSchema(keyOptions.type, {
      keyName,
      keyOptions,
    });

    finalSchema = finalSchema.concat(schema);
  }

  const { error, value } = finalSchema.validate(object, {
    escapeHtml: true,
  });

  if (error) {
    throw new ValidationError({
      message: error.details[0].message,
    });
  }

  return value;
}

function hydrateSchema(schema, { keyName, keyOptions }) {
  let schemaToConcat = schema(keyName, keyOptions);

  if (keyOptions.required) {
    schemaToConcat = schemaToConcat.required();
  }

  if (keyOptions.allowNull) {
    schemaToConcat = schemaToConcat.allow(null);
  } else {
    schemaToConcat = schemaToConcat.invalid(null);
  }

  if (keyOptions.allowEmptyString) {
    schemaToConcat = schemaToConcat.allow("");
  }

  let objectToConcat = {};
  objectToConcat[keyName] = schemaToConcat;
  return Joi.object(objectToConcat);
}

const schemas = {
  UUID: (keyName, options) => {
    return Joi.string()
      .trim()
      .guid({ version: "uuidv4" })
      .messages({
        "any.required": `"${keyName}" é um campo obrigatório.`,
        "string.empty": `"${keyName}" não pode estar em branco.`,
        "string.base": `"${keyName}" deve ser do tipo String.`,
        "string.guid": `"${keyName}" deve possuir um token UUID na versão 4.`,
        "any.invalid": `"${keyName}" não pode ser "null".`,
      });
  },

  EMAIL: (keyName, options) => {
    return Joi.string()
      .email()
      .min(7)
      .max(254)
      .lowercase()
      .trim()
      .messages({
        "any.required": `"${keyName}" é um campo obrigatório.`,
        "string.empty": `"${keyName}" não pode estar em branco.`,
        "string.base": `"${keyName}" deve ser do tipo String.`,
        "string.email": `"${keyName}" deve conter um email válido.`,
        "any.invalid": `"${keyName}" não pode ser "null".`,
      });
  },

  STRING_AUTH_METHODS: (keyName, options) => {
    return Joi.string()
      .trim()
      .valid("email_verification", "credentials", "admin")
      .messages({
        "any.required": `"${keyName}" é um campo obrigatório.`,
        "string.empty": `"${keyName}" não pode estar em branco.`,
        "string.base": `"${keyName}" deve ser do tipo String.`,
        "any.only": `'${keyName}' deve possuir um dos seguintes valores: 'email_credencials', 'credentials' ou 'admin'.`,
      });
  },

  STRING: (keyName, options) => {
    return Joi.string()
      .min(options.min || 0)
      .max(options.max || 255)
      .messages({
        "any.required": `"${keyName}" é um campo obrigatório.`,
        "string.empty": `"${keyName}" não pode estar em branco.`,
        "string.base": `"${keyName}" deve ser do tipo String.`,
        "string.min": `"${keyName}" deve conter no mínimo {#limit} caracteres.`,
        "string.max": `"${keyName}" deve conter no máximo {#limit} caracteres.`,
        "any.invalid": `"${keyName}" não pode ser "null".`,
      });
  },

  STRING_UPPERCASE: (keyName, options) => {
    return Joi.string()
      .min(options.min || 0)
      .max(options.max || 255)
      .messages({
        "any.required": `"${keyName}" é um campo obrigatório.`,
        "string.empty": `"${keyName}" não pode estar em branco.`,
        "string.base": `"${keyName}" deve ser do tipo String.`,
        "string.min": `"${keyName}" deve conter no mínimo {#limit} caracteres.`,
        "string.max": `"${keyName}" deve conter no máximo {#limit} caracteres.`,
        "any.invalid": `"${keyName}" não pode ser "null".`,
      });
  },
};

export default Object.freeze({
  run,
  types: schemas,
});
