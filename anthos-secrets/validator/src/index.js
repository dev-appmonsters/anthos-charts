const { logger, schemaBuilder, utils } = require('../lib')
const fs = require('fs')
const Schema = require('validate')
const execSync = require('child_process').execSync

const validateSchema = (targetObject, options = {}) => {
  if (!targetObject) { return logger.error('Missing argument: either targetObject or filePath is required') }
  let isPath = typeof targetObject === 'string'
  if (isPath ? !fs.existsSync(targetObject) : typeof targetObject !== 'object') { return logger.error('Target must be either be an object or a valid filepath') }

  logger.info(`Validating schema for: ${targetObject}`)
  try {
    let inputSchema = options.schema || options.schemaPath || `${__dirname}/../examples/schema.json`
    const schema = schemaBuilder.getSchema(inputSchema)
    const content = isPath ? utils.loadContent(targetObject) : targetObject
    checkKubeContext(content['kube-context'])
    const clone = JSON.parse(JSON.stringify(content))
    const misMatches = new Schema(schema).validate(content)
    const extraFiels = validateExtraFields(clone, schema)
    return printErrors(misMatches, extraFiels)
  } catch (error) {
    logger.error(error)
    process.exit(2)
  }
}

const checkKubeContext = (kubeContext) => {
  if (!kubeContext) {
    logger.error('You need to define `kube-context` top level key in the values file')
    throw (Error('Kubectl context not defined in values file'))
  }
  if (kubeContext.toString().trim() !== execSync('kubectl config current-context').toString().trim()) {
    logger.error('====== Kubectl context validation failed ======')
    logger.error('You might be making some mistake please re-verify the values file and kubectl current context')
    throw (Error('Kubectl context validation failed'))
    process.exit(2)
  }
}

const validateExtraFields = (targetObj, schemaObj) => {
  let extras = []

  const leafNode = (obj) => {
    return obj && ([String, Number, Boolean].includes(obj.type) || typeof obj.required === 'boolean')
  }

  const _parseTarget = (target, schema, parsedLevel = '') => {
    if (typeof target !== 'object') {
      return
    }

    for (let key in target) {
      let schemaKey = target instanceof Array ? schema[0] : schema[key]
      const nextLevel = parsedLevel ? `${parsedLevel}.${key}` : key
      if (!schemaKey || typeof target[key] !== 'object' && !leafNode(schemaKey)) {
        extras.push({ path: nextLevel, message: `${nextLevel} is not present in schema`})
      } else {
        _parseTarget(target[key], schemaKey, nextLevel)
      }
    }
  }

  _parseTarget(targetObj, schemaObj)
  return extras
}

const printErrors = (errors, warnings) => {
  if (errors.length || warnings.length) {
    logger.error('====== Schema Validation Error ======')
    logger.error(`${errors.length} mismatches and ${warnings.length} warnings found.`)
    errors.forEach((err, index) => logger.red(`${index + 1}. ${err.message}`))
    warnings.forEach((warn, index) => logger.yellow(`${index + 1}. ${warn.message}`))
    process.exit(2)
  } else {
    logger.success('Schema Validated Successfully')
  }
  return errors.concat(warnings)
}

module.exports = validateSchema
