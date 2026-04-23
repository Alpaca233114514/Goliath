import { TFile, TAbstractFile, Vault, MetadataCache } from "obsidian";
import { FileContext } from "../api/types";

export async function readFileContent(
  vault: Vault,
  file: TFile
): Promise<string> {
  return vault.cachedRead(file);
}

export function getFrontmatter(
  metadataCache: MetadataCache,
  file: TFile
): Record<string, unknown> | undefined {
  const cache = metadataCache.getFileCache(file);
  if (!cache?.frontmatter) return undefined;
  return cache.frontmatter;
}

export async function buildFileContext(
  vault: Vault,
  metadataCache: MetadataCache,
  file: TFile,
  includeFrontmatter: boolean
): Promise<FileContext> {
  const content = await readFileContent(vault, file);
  const frontmatter = includeFrontmatter
    ? getFrontmatter(metadataCache, file)
    : undefined;

  return {
    path: file.path,
    content,
    frontmatter,
  };
}

export function getLinkedFiles(
  metadataCache: MetadataCache,
  file: TFile,
  vault: Vault,
  depth: number = 1
): TFile[] {
  if (depth <= 0) return [];

  const cache = metadataCache.getFileCache(file);
  const links = cache?.links ?? [];
  const result: TFile[] = [];

  for (const link of links) {
    const linkedFile = metadataCache.getFirstLinkpathDest(link.link, file.path);
    if (linkedFile instanceof TFile) {
      result.push(linkedFile);
      if (depth > 1) {
        result.push(...getLinkedFiles(metadataCache, linkedFile, vault, depth - 1));
      }
    }
  }

  return [...new Set(result)];
}

export async function buildContextWithLinked(
  vault: Vault,
  metadataCache: MetadataCache,
  file: TFile,
  includeFrontmatter: boolean,
  includeLinked: boolean,
  maxDepth: number
): Promise<FileContext[]> {
  const contexts: FileContext[] = [];
  contexts.push(await buildFileContext(vault, metadataCache, file, includeFrontmatter));

  if (includeLinked) {
    const linked = getLinkedFiles(metadataCache, file, vault, maxDepth);
    for (const linkedFile of linked) {
      if (linkedFile.path !== file.path) {
        contexts.push(
          await buildFileContext(vault, metadataCache, linkedFile, includeFrontmatter)
        );
      }
    }
  }

  return contexts;
}
