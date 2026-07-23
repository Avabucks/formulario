"use client";

import { useMemo } from "react";
import { useTree } from "@headless-tree/react";
import { syncDataLoaderFeature, hotkeysCoreFeature } from "@headless-tree/core";
import { FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react";
import { Tree, TreeItem, TreeItemLabel } from "../../ui/tree";

interface ItemData {
  name: string;
  children?: string[];
  isFolder?: boolean;
}

function getItemIcon(item: any) {
  if (!item.isFolder()) {
    return <FileIcon className="text-muted-foreground pointer-events-none size-4 shrink-0" />;
  }

  if (item.isExpanded()) {
    return <FolderOpenIcon className="text-muted-foreground pointer-events-none size-4 shrink-0" />;
  }

  return <FolderIcon className="text-muted-foreground pointer-events-none size-4 shrink-0" />;
}

export default function TreeFiles({ tree }: Readonly<{ tree: any[] }>) {
  const indent = 20;

  // Normalizza il tree del server in una mappa indicizzata per il dataLoader
  const { dataMap, rootChildren } = useMemo(() => {
    const map: Record<string, ItemData> = {};
    const rootIds: string[] = [];

    if (Array.isArray(tree)) {
      tree.forEach((capitolo: any) => {
        const capId = String(capitolo.id);
        rootIds.push(capId);

        const argomenti = capitolo.argomenti || [];
        const childIds = argomenti.map((arg: any) => String(arg.id));

        map[capId] = {
          name: capitolo.titolo || "Capitolo senza titolo",
          children: childIds,
          isFolder: true,
        };

        argomenti.forEach((arg: any) => {
          const argId = String(arg.id);
          map[argId] = {
            name: arg.titolo || "Argomento senza titolo",
            isFolder: false,
          };
        });
      });
    }

    map["root"] = {
      name: "Root",
      children: rootIds,
      isFolder: true,
    };

    return { dataMap: map, rootChildren: rootIds };
  }, [tree]);

  const treeNormalized = useTree<ItemData>({
    initialState: {
      expandedItems: rootChildren,
    },
    indent,
    rootItemId: "root",
    getItemName: (item) => item.getItemData()?.name ?? "",
    isItemFolder: (item) => Boolean(item.getItemData()?.children && item.getItemData()?.children!.length > 0),
    dataLoader: {
      getItem: (itemId) => dataMap[itemId] || { name: String(itemId) },
      getChildren: (itemId) => dataMap[itemId]?.children ?? [],
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature],
  });

  return (
    <div className="w-64 shrink-0 h-full overflow-y-auto border-r border-border/80 p-3">
      <Tree
        className="relative before:absolute before:inset-0 before:-ms-1 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]"
        indent={indent}
        tree={treeNormalized}
      >
        {treeNormalized.getItems().map((item) => {
          return (
            <TreeItem key={item.getId()} item={item}>
              <TreeItemLabel className="before:bg-background relative before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10">
                <span className="flex items-center gap-2 w-full min-w-0">
                  {getItemIcon(item)}
                  <span className="truncate min-w-0 flex-1 text-left">
                    {item.getItemName()}
                  </span>
                </span>
              </TreeItemLabel>
            </TreeItem>
          );
        })}
      </Tree>
    </div>
  );
}
