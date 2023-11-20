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
        "any.required": `'${keyName}' é um campo obrigatório.`,
        "string.empty": `'${keyName}' não pode estar em branco.`,
        "string.base": `'${keyName}' deve ser do tipo String.`,
        "string.guid": `'${keyName}' deve possuir um token UUID na versão 4.`,
        "any.invalid": `'${keyName}' não pode ser 'null'.`,
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
        "any.required": `'${keyName}' é um campo obrigatório.`,
        "string.empty": `'${keyName}' não pode estar em branco.`,
        "string.base": `'${keyName}' deve ser do tipo String.`,
        "string.email": `'${keyName}' deve conter um email válido.`,
        "any.invalid": `'${keyName}' não pode ser 'null'.`,
      });
  },

  STRING_AUTH_METHODS: (keyName, options) => {
    return Joi.string()
      .trim()
      .valid("email_verification", "credentials", "admin")
      .messages({
        "any.required": `'${keyName}' é um campo obrigatório.`,
        "string.empty": `'${keyName}' não pode estar em branco.`,
        "string.base": `'${keyName}' deve ser do tipo String.`,
        "any.only": `'${keyName}' deve possuir um dos seguintes valores: 'email_credencials', 'credentials' ou 'admin'.`,
      });
  },

  STRING: (keyName, options) => {
    return Joi.string()
      .min(options.min || 1)
      .max(options.max || 255)
      .messages({
        "any.required": `'${keyName}' é um campo obrigatório.`,
        "string.empty": `'${keyName}' não pode estar em branco.`,
        "string.base": `'${keyName}' deve ser do tipo String.`,
        "string.min": `'${keyName}' deve conter no mínimo {#limit} caracteres.`,
        "string.max": `'${keyName}' deve conter no máximo {#limit} caracteres.`,
        "any.invalid": `'${keyName}' não pode ser 'null'.`,
      });
  },

  STRING_TRIM: (keyName, options) => {
    return Joi.string()
      .min(options.min || 1)
      .max(options.max || 255)
      .trim()
      .messages({
        "any.required": `'${keyName}' é um campo obrigatório.`,
        "string.empty": `'${keyName}' não pode estar em branco.`,
        "string.base": `'${keyName}' deve ser do tipo String.`,
        "string.min": `'${keyName}' deve conter no mínimo {#limit} caracteres.`,
        "string.max": `'${keyName}' deve conter no máximo {#limit} caracteres.`,
        "any.invalid": `'${keyName}' não pode ser 'null'.`,
      });
  },

  STRING_CPF: (keyName, options) => {
    return Joi.string()
      .pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
      .trim()
      .messages({
        "any.required": `'${keyName}' é um campo obrigatório.`,
        "string.empty": `'${keyName}' não pode estar em branco.`,
        "string.base": `'${keyName}' deve ser do tipo String.`,
        "string.pattern.base": `'${keyName}' deve ser um CPF válido.`,
        "string.min": `'${keyName}' deve conter no mínimo {#limit} caracteres.`,
        "string.max": `'${keyName}' deve conter no máximo {#limit} caracteres.`,
        "any.invalid": `'${keyName}' não pode ser 'null'.`,
      });
  },

  STRING_UPPERCASE: (keyName, options) => {
    return Joi.string()
      .min(options.min || 1)
      .max(options.max || 255)
      .messages({
        "any.required": `'${keyName}' é um campo obrigatório.`,
        "string.empty": `'${keyName}' não pode estar em branco.`,
        "string.base": `'${keyName}' deve ser do tipo String.`,
        "string.min": `'${keyName}' deve conter no mínimo {#limit} caracteres.`,
        "string.max": `'${keyName}' deve conter no máximo {#limit} caracteres.`,
        "any.invalid": `'${keyName}' não pode ser 'null'.`,
      });
  },

  BOOLEAN: (keyName, options) => {
    return Joi.boolean().messages({
      "any.required": `'${keyName}' é um campo obrigatório.`,
      "string.empty": `'${keyName}' não pode estar em branco.`,
      "boolean.base": `'${keyName}' deve ser do tipo Boolean.`,
      "any.invalid": `'${keyName}' não pode ser 'null'.`,
    });
  },

  ARRAY: (keyName, options) => {
    return Joi.array();
  },

  ARRAY_OF_OBJECTS: (keyName, options) => {
    const objectSchema = {};

    for (const key in options.objectSchema) {
      const typer = options.objectSchema[key];
      objectSchema[key] = typer(key, options);
    }

    return Joi.array()
      .items(Joi.object(objectSchema))
      .min(options.min || 0)
      .messages({
        "array.base": `'${keyName}' deve ser do tipo Array.`,
        "any.required": `'${keyName}' é um campo obrigatório.`,
        "any.invalid": `'${keyName}' não pode ser 'null'.`,
        "array.min": `'${keyName}' deve conter pelo menos 1 item.`,
      });
  },
};

export default Object.freeze({
  run,
  types: schemas,
});
