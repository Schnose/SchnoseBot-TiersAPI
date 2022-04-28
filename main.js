const { default: axios } = require("axios");
require("dotenv").config();

async function googleSheet() {
	let result;
	await axios
		.get(
			`https://sheets.googleapis.com/v4/spreadsheets/1VesD4MIyt4L6bTw7Vvf4yhUmS0cdg3j6_OdneAjXxiM/?key=${process.env.API_KEY}`,
			{
				params: {
					includeGridData: true,
				},
			}
		)
		.then((response) => (result = response))
		.catch((e) => console.error(e));
	return result;
}

async function main() {
	const response = await googleSheet();

	let maps = {};
	const data = response.data;
	const sheets = data.sheets;
	const overview = sheets[1].data[0].rowData;
	const sheetKZT = sheets[2].data[0].rowData;
	const sheetSKZ = sheets[3].data[0].rowData;
	const sheetVNL = sheets[4].data[0].rowData;

	for (let row = 1; row < overview.length; row++) {
		const map = overview[row];
		const mapName = map.values[0].formattedValue;
		const courseInt = parseInt(map.values[1].formattedValue);
		let jumpstats = map.values[2].formattedValue;
		if (jumpstats)
			switch (jumpstats.toLowerCase()) {
				case "yes":
					jumpstats = "true";
					break;
				case "no":
					jumpstats = "false";
					break;
			}
		else jumpstats = "maybe";
		const tags = map.values[3].formattedValue?.split(",").map((tag) => tag.trim()) || [];

		let course = "";
		if (courseInt === 0) course = "main";
		else course = `bonus${courseInt}`;

		if (!maps.hasOwnProperty(mapName)) {
			maps[mapName] = {
				jsArea: jumpstats,
			};
		}

		Object.defineProperty(maps[mapName], course, {
			writable: true,
			enumerable: true,
			value: {
				SKZ: {
					tpTier: null,
					proTier: null,
				},
				KZT: {
					tpTier: null,
					proTier: null,
				},
				VNL: {
					tpTier: null,
					proTier: null,
				},
				tags: tags,
			},
		});

		kztRow = sheetKZT[row].values;
		skzRow = sheetSKZ[row].values;
		vnlRow = sheetVNL[row].values;

		// use parseInt() or ".effectiveValue.numberValue" for integer value
		maps[mapName][course].KZT.tpTier = kztRow[2].formattedValue;
		maps[mapName][course].KZT.proTier = kztRow[3].formattedValue;
		maps[mapName][course].SKZ.tpTier = skzRow[2].formattedValue;
		maps[mapName][course].SKZ.proTier = skzRow[3].formattedValue;
		maps[mapName][course].VNL.tpTier = vnlRow[2].formattedValue;
		maps[mapName][course].VNL.proTier = vnlRow[3].formattedValue;
	}

	return maps;
}

module.exports = main;
