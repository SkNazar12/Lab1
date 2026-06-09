import { getList } from "./apiClient.js";
import { renderList, renderListStatus } from "./ui.js";
import type { ApiError } from "./dtos.js";

async function loadList() {
    renderListStatus("loading");
    try {
        const response = await getList();
        const items = (response as any).data;

        if (items.length === 0) {
            renderListStatus("empty");
        } else {
            renderList(items);
            renderListStatus("success");
        }
    } catch (err) {
        renderListStatus("error", err as ApiError);
    }
}

document.addEventListener("DOMContentLoaded", loadList);