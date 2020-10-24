import * as Discord from "discord.js";
import roles from "../roles";
import { pmdDB } from "../database/client";
import { success } from "../util/debug";
import { client } from "..";

const col = pmdDB.collection("presences");

module.exports.run = async (client: Discord.Client) => {
	if (client.user) success(`Connected as ${client.user.tag}`);
	updatePresenceAuthors();
	updateBoosters();
	setInterval(() => {
		updatePresenceAuthors();
		updateBoosters();
	}, 15 * 60 * 1000);
};

async function updatePresenceAuthors() {
	const guild = client.guilds.cache.get("493130730549805057"),
		presenceAuthors = (await col.find().toArray()).map(
			(p) => p.metadata.author.id
		);

	for (const author of presenceAuthors) {
		const member = guild.members.resolve(author);
		if (member && !member.roles.cache.has(roles.presence))
			member.roles.add(roles.presence);
	}
}

function updateBoosters() {
	const dateNow = new Date(),
		last90days = new Date(
			dateNow.setDate(dateNow.getDate() - 3 * 30)
		).getTime(),
		membersWithBoost = client.guilds.cache
			.get("493130730549805057")
			.members.cache.array()
			.filter((member) => member.premiumSinceTimestamp > 0);

	for (const member of membersWithBoost) {
		if (member) {
			const userBoost = member.premiumSinceTimestamp;

			if (last90days > userBoost) {
				if (!member.roles.cache.has(roles.donator))
					member.roles.add(roles.donator);

				if (
					!member.roles.cache.has(roles.beta) &&
					!member.roles.cache.has(roles.alpha)
				)
					member.roles.add(roles.beta);
			}
		}
	}
}

module.exports.config = {
	clientOnly: true,
};
