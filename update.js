const { default: mongoose } = require("mongoose");
const main = require("./main");
const sheetSchema = require("./schemas/sheet-schema");
const time = Date.now();

mongoose
	.connect(process.env.DATABASE, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log(`[${time}] Connected to database.`))
	.catch((e) => console.error(e));

async function update() {
	const maps = await main();

	sheetSchema.findOne(async (err, data) => {
		if (err) return console.error(err);

		if (!data) {
			new sheetSchema({
				mapList: maps,
			}).save();
		} else {
			mapList = maps;

			await sheetSchema.findOneAndUpdate(data);
		}

		console.log(`[${time}] Database was updated.`);
	});
}

update();
