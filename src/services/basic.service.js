//This method offers benefits such as abstraction, consistency, reusability, customization, dependency injection, and encapsulation, making your codebase more robust and maintainable.

class BasicServices {
  constructor(modal) {
    this.modal = modal;
  }
  paginate = (filter, options) => {
    return this.modal.paginate(filter, options);
  };
  create = (body) => {
    return this.modal.create({ ...body });
  };
  exists = (filter) => {
    return this.modal.exists({ ...filter });
  };
  find = (filter) => {
    return this.modal.find({ ...filter });
  };
  findOne = (filter) => {
    return this.modal.findOne({ ...filter });
  };
  findById = (id) => {
    return this.modal.findById(id);
  };
  findByIdAndUpdate = (id, body) => {
    return this.modal.findByIdAndUpdate(id, { ...body });
  };
  findOneAndUpdate = (filter, body) => {
    return this.modal.findOneAndUpdate({ ...filter }, { ...body });
  };
  findByIdAndDelete = (id) => {
    return this.modal.findByIdAndDelete(id);
  };

  deleteOne = (filter) => {
    return this.modal.deleteOne({ ...filter });
  };
  deleteMany = (filter) => {
    return this.modal.deleteMany({ ...filter });
  };
}

module.exports = BasicServices;
