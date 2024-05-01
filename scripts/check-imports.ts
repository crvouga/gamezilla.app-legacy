// @ts-ignore
import * as fs from "node:fs";
// @ts-ignore
import * as path from "node:path";

interface FileImport {
	path: string;
	imports: string[];
}

async function findTsFiles(dir: string): Promise<string[]> {
	let files = await fs.promises.readdir(dir, { withFileTypes: true });
	let tsFiles = files
		.filter((dirent) => dirent.isFile() && dirent.name.endsWith(".ts"))
		.map((dirent) => path.join(dir, dirent.name));

	let dirs = files.filter((dirent) => dirent.isDirectory());
	for (let dirent of dirs) {
		tsFiles = tsFiles.concat(await findTsFiles(path.join(dir, dirent.name)));
	}

	return tsFiles;
}

function extractImports(content: string): string[] {
	const importRegex = /import\s+(.*?)\s+from/g;
	let matches;
	const imports = [];
	while ((matches = importRegex.exec(content)) !== null) {
		const match = matches[1]!;
		// @ts-ignore
		imports.push(match);
	}

	return imports;
}

async function generateImportList(baseDir: string): Promise<FileImport[]> {
	const allTsFiles = await findTsFiles(baseDir);
	const importList: FileImport[] = [];

	for (let filePath of allTsFiles) {
		const fileContent = await fs.promises.readFile(filePath, "utf-8");
		const imports = extractImports(fileContent);
		importList.push({ path: filePath, imports });
	}

	return importList;
}

// Replace './src' with your root directory
generateImportList("./gamezilla")
	.then((_importList) => {})
	.catch((err) => {
		console.error(err);
	});
