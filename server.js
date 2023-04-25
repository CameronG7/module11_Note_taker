const express = require("express");
const fs = require("fs");
const notes = require("./db/db.json");
const path = require("path");
const uuid = require("./helpers/uuid");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) =>
	res.sendFile(path.join(__dirname, "/public/index.html"))
);

app.get("/notes", (req, res) =>
	res.sendFile(path.join(__dirname, "/public/notes.html"))
);

app.get("/api/notes", (req, res) => {
	fs.readFile("./db/db.json", "utf8", (err, data) => {
		if (err) {
			return res.status(500).json({ err });
		}
		res.json(JSON.parse(data));
	});
});

app.get("/api/notes/:id", (req, res) => {
	if (req.params.id) {
		const note_id = req.params.id;
		for (let i = 0; i < notes.length; i++) {
			const currentNote = notes[i];
			if (currentNote.id === note_id) {
				res.status(200).json(currentNote);
				return;
			}
		}
	}
});

app.post("/api/notes", async (req, res) => {
	const { title, text } = req.body;

	if (title && text) {
		fs.readFile("./db/db.json", "utf8", (err, notes) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ err });
			}
			const id = uuid();
			const data = JSON.parse(notes);
		
			data.push({
				title,
				text,
				id,
			});

			fs.writeFile("./db/db.json", JSON.stringify(data, null, 2), (err) => {
				if (err) {
					console.error(err);
					return res.status(500).json({ err });
				}
				console.info("Note added successfully");
				res.json({
					title,
					text,
					id,
				});
			});
		});
	} else {
		res.status(400).json({ error: "Title and text required" });
	}
});

app.delete("/api/notes/:id", (req, res) => {
	if (req.params.id) {
		const note_id = req.params.id;
		fs.readFile("./db/db.json", "utf8", (err, data) => {
			
			if (err) {
				return res.status(500).json({ err });
			}
			const dbData = JSON.parse(data);
			console.log(dbData)
			for (let i = 0; i < dbData.length; i++) {
				console.log(dbData[i]);
				if (dbData[i].id === note_id) {
					dbData.splice(i, 1);
					break;
				}
			}

			fs.writeFile("./db/db.json", JSON.stringify(dbData, null, 2), (err) => {
				if (err) {
					console.log(err);
					return res.status(500).json({ err });
				}
				console.info("Note list saved");
				res.send(`note with id ${note_id} has been deleted`);
			});

		});
	}
});

app.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`);
});
