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
		const map_name = map.values[0].formattedValue;
		const course_int = parseInt(map.values[1].formattedValue);
		const jumpstats = map.values[2].formattedValue.toLowerCase() === "yes" ? true : false;
		const tags = map.values[3].formattedValue?.split(",").map((tag) => tag.trim()) || [];

		let course = "";
		if (course_int === 0) course = "main";
		else course = `bonus${course_int}`;

		if (!maps.hasOwnProperty(map_name)) {
			maps[map_name] = {
				jsArea: jumpstats,
			};
		}

		Object.defineProperty(maps[map_name], course, {
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

		kzt_row = sheetKZT[row].values;
		skz_row = sheetSKZ[row].values;
		vnl_row = sheetVNL[row].values;

		// use parseInt() or ".effectiveValue.numberValue" for integer value
		maps[map_name][course].KZT.tpTier = kzt_row[2].formattedValue;
		maps[map_name][course].KZT.proTier = kzt_row[3].formattedValue;
		maps[map_name][course].SKZ.tpTier = skz_row[2].formattedValue;
		maps[map_name][course].SKZ.proTier = skz_row[3].formattedValue;
		maps[map_name][course].VNL.tpTier = vnl_row[2].formattedValue;
		maps[map_name][course].VNL.proTier = vnl_row[3].formattedValue;
	}

	return maps;
}

module.exports = main;
