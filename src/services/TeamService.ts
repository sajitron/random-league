import Team from '../models/Team';
import Fixture from '../models/Fixture';

const TeamService = {
  async createTeam(data: any) {
    try {
      const team = new Team(data);

      await await team.save();

      return team;
    } catch (error) {
      throw error;
    }
  },

  async getTeamByName(value: string) {
    try {
      const team = await Team.findOne({ team_name: value });
      return team;
    } catch (error) {
      throw error;
    }
  },

  async getTeamByID(id: string) {
    try {
      const team = await Team.findById(id).populate('creator').populate('fixtures');
      return team;
    } catch (error) {
      throw error;
    }
  },

  async getTeams() {
    try {
      const teams = await Team.find({}).populate('creator').populate('fixtures').sort({ created_at: -1 });
      return teams;
    } catch (error) {
      throw error;
    }
  },

  async updateTeam(id: string, data: any) {
    try {
      const team = await Team.findByIdAndUpdate(id, { $set: data }, { new: true })
        .populate('creator')
        .populate('fixtures');
      return team;
    } catch (error) {
      throw error;
    }
  },

  async removeTeam(id: string) {
    try {
      await Team.findByIdAndRemove(id);
      return 'team removed';
    } catch (error) {
      throw error;
    }
  },

  async search(searchString: string) {
    try {
      const teams = await Team.find({
        $or: [
          {
            team_name: {
              $regex: searchString,
              $options: 'i',
            },
          },
          {
            stadium: {
              $regex: searchString,
              $options: 'i',
            },
          },
          {
            coach: {
              $regex: searchString,
              $options: 'i',
            },
          },
        ],
      }).populate('fixtures');

      const fixtures = await Fixture.find({
        $or: [
          {
            venue: {
              $regex: searchString,
              $options: 'i',
            },
          },
        ],
      })
        .populate('home_team')
        .populate('away_team');
      return { teams, fixtures };
    } catch (error) {
      throw error;
    }
  },
};

export default TeamService;
