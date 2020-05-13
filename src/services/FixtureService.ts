import Fixture from '../models/Fixture';

const FixtureService = {
  async createFixture(data: any) {
    try {
      const fixture = new Fixture(data);

      await fixture.save();

      return fixture;
    } catch (error) {
      throw error;
    }
  },

  async getFixtureByVenue(venue: string) {
    try {
      const fixtures = await Fixture.find({ venue }).sort({ created_at: -1 });
      return fixtures;
    } catch (error) {
      throw error;
    }
  },

  async getFixtureByLink(link: string) {
    try {
      const fixture = await Fixture.findOne({ link }).populate('home_team').populate('away_team');
      return fixture;
    } catch (error) {
      throw error;
    }
  },

  async getFixtureByStatus(completed: boolean) {
    try {
      const fixtures = await Fixture.find({ completed })
        .populate('home_team')
        .populate('away_team')
        .sort({ created_at: -1 });
      return fixtures;
    } catch (error) {
      throw error;
    }
  },

  async getFixtureByID(id: string) {
    try {
      const fixture = await Fixture.findById(id).populate('home_team').populate('away_team');
      return fixture;
    } catch (error) {
      throw error;
    }
  },

  async getFixtures() {
    try {
      const users = await Fixture.find({}).populate('home_team').populate('away_team').sort({ created_at: -1 });
      return users;
    } catch (error) {
      throw error;
    }
  },

  async updateFixture(id: string, data: any) {
    try {
      const fixture = await Fixture.findByIdAndUpdate(id, { $set: data }, { new: true })
        .populate('home_team')
        .populate('away_team');
      return fixture;
    } catch (error) {
      throw error;
    }
  },

  async removeFixture(id: string) {
    try {
      await Fixture.findByIdAndRemove(id);
      return 'fixture removed';
    } catch (error) {
      throw error;
    }
  },
};

export default FixtureService;
