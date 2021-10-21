/**
 * Bosch Rexroth multi parameter file converter
 * converts one or more files into multiple files named after their address and drive name
 */

//fetch files from cli
const singleFile = process.argv.slice(2)[0];
const multiFile = process.argv.slice(2);

//exit if no file provided
if (!singleFile) process.exit(128);

//require modules
const { readFileSync, writeFileSync, mkdirSync } = require("fs");
const { dirname, join } = require("path");

//main function _singleFile is the absolute path to a parameter file
const readSingleFile = (_singleFile) => {

	//try creating folders in dir of parameter file
	try {
		mkdirSync(join(dirname(_singleFile), "Antriebsregler"));
		mkdirSync(join(dirname(_singleFile), "IAC-2x"));
	} catch(e) {}

	//get content of parameter file and add workaround for split function
	var singleFileRead = readFileSync(_singleFile, 'latin1');
	singleFileRead = "SERCOS-ASCII\r\n" + singleFileRead;

	//split file for each drive and loop trough it
	const singleFileArray = singleFileRead.split("SERCOS-ASCII\r\n");
	singleFileArray.forEach(drive => {

		//default values for drive name, address and type
		let driveName = false;
		let driveAddress = "??";
		let driveDir = "";

		//split single parameter file by line and check for address and name
		if (drive.split("\n")[1]) {
			driveName = String(drive.split("\n")[1]).replace(/(?:\r\n|\r|\n)/g, '');
			driveAddress = String(drive.split("\n")[3]).replace(/(?:\r\n|\r|\n)/g, '');
			driveName.match(/Hyd|SP|C/g) ? driveDir = "Antriebsregler" : driveDir = "IAC-2x";
		}

		//if name is defined write file to given folder
		if (driveName) writeFileSync(join(dirname(_singleFile), driveDir, driveAddress + "_" + driveName + ".par"), "SERCOS-ASCII\n" + singleFileRead);
	});
}

//check if multiple files where provided and loop trough them
multiFile.length > 1 ? multiFile.forEach(_singleFile => readSingleFile(_singleFile)) : readSingleFile(singleFile);

