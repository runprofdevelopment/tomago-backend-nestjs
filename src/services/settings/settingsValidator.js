module.exports = class SettingsValidator {
  static validate(data) {
    if ('vat' in data) {
      if (typeof data.vat !== 'number' || data.vat < 0 || data.vat > 100) {
        throw new Error('"vat" must be a number between 0 and 100');
      }
    }
  }
};