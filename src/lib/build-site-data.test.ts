import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { noteWithLinks, publishedNote } from "../../test/helpers/note-fixtures";

const getCollectionMock = vi.fn<() => unknown>();

vi.mock("astro:content", () => ({
  getCollection: getCollectionMock,
}));

describe("build site data cache", () => {
  beforeEach(() => {
    getCollectionMock.mockReset();
    vi.resetModules();
  });

  afterEach(async () => {
    const { clearBuildSiteDataCache } = await import("./build-site-data");
    clearBuildSiteDataCache();
  });

  it("returns stable cached results and avoids duplicate collection loads", async () => {
    getCollectionMock.mockResolvedValue([
      noteWithLinks("alpha", ["beta"], { title: "Alpha Note" }),
      publishedNote("beta", { title: "Beta Note" }),
    ]);

    const { clearBuildSiteDataCache, getBuildSiteData } = await import("./build-site-data");

    clearBuildSiteDataCache();
    const first = await getBuildSiteData();
    const second = await getBuildSiteData();

    expect(first).toBe(second);
    expect(getCollectionMock).toHaveBeenCalledTimes(1);
    expect(first.linksByNote.get("alpha")).toEqual(new Set(["beta"]));
    expect(first.backlinksMap.get("beta")).toEqual([{ href: "/alpha", title: "Alpha Note" }]);
  });

  it("rebuilds after clearing the cache", async () => {
    getCollectionMock.mockResolvedValue([publishedNote("alpha", { title: "Alpha" })]);

    const { clearBuildSiteDataCache, getBuildSiteData } = await import("./build-site-data");

    clearBuildSiteDataCache();
    await getBuildSiteData();
    clearBuildSiteDataCache();
    await getBuildSiteData();

    expect(getCollectionMock).toHaveBeenCalledTimes(2);
  });
});
