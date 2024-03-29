import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const directoryPath = path.join(__dirname, 'build'); // Adjust 'build' to your output directory

const adjustImports = (dir) => {
	fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
		const entryPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			adjustImports(entryPath);
		} else if (entry.isFile() && entry.name.endsWith('.js')) {
			let content = fs.readFileSync(entryPath, 'utf8');
			content = content.replace(/from\s+['"](.+?)['"]/g, (match, p1) => {
				if (p1.startsWith('.') && !p1.endsWith('.js')) {
					return match.replace(p1, `${p1}.js`);
				}
				return match;
			});
			fs.writeFileSync(entryPath, content, 'utf8');
		}
	});
};

adjustImports(directoryPath);
