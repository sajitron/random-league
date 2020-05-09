import User from '../models/User';
import Utils from '../utils/utils';

const UserService = {
  async createUser(data: any) {
    try {
      const user = new User(data);

      await user.save();

      return user;
    } catch (error) {
      throw error;
    }
  },

  async getUserByEmail(value: string) {
    try {
      const user = await User.findOne({ email: value });
      return user;
    } catch (error) {
      throw error;
    }
  },

  async getUserByID(id: string) {
    try {
      const user = await User.findById(id).select('-password');
      return user;
    } catch (error) {
      throw error;
    }
  },

  async getUsers() {
    try {
      const users = await User.find({}).select('-password');
      return users;
    } catch (error) {
      throw error;
    }
  },

  async updateUser(id: string, data: any) {
    try {
      const user = await User.findByIdAndUpdate(id, { $set: data }, { new: true });
      return user;
    } catch (error) {
      throw error;
    }
  },

  async removeUser(id: string) {
    try {
      await User.findByIdAndRemove(id);
      return 'user removed';
    } catch (error) {
      throw error;
    }
  },

  async uploadImage(req: any) {
    try {
      const imageURI = Utils.bufferToDataUri(req.file.buffer);

      const result = await Utils.uploader.upload(imageURI);
      return result.secure_url;
    } catch (error) {
      return 'error uploading image';
    }
  },
};

export default UserService;
