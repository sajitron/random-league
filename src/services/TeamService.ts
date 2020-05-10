import Team from '../models/Team';

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
      const team = await Team.findById(id).populate('creator');
      return team;
    } catch (error) {
      throw error;
    }
  },

  async getTeams() {
    try {
      const teams = await Team.find({}).populate('creator');
      return teams;
    } catch (error) {
      throw error;
    }
  },

  async updateTeam(id: string, data: any) {
    try {
      const team = await Team.findByIdAndUpdate(id, { $set: data }, { new: true }).populate('creator');
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
};

export default TeamService;
