import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from "@jupyterlab/application";
import { URLExt } from "@jupyterlab/coreutils";
import { IFileBrowserFactory, FileBrowser } from "@jupyterlab/filebrowser";
import { ServerConnection } from "@jupyterlab/services";
import { JSONObject } from "@phosphor/coreutils";
import { toArray } from "@phosphor/algorithm";
import { showErrorMessage } from "@jupyterlab/apputils";

// API end point
const API = "download-folder";
// Archive format
const FORMAT = "zip";

namespace CommandIDs {
  export const downloadFolder = "jupyterlab-download-folder:download"
}

function zipAndDownload(browser: FileBrowser): void {
  const items = toArray(browser.selectedItems())
  if(items.length > 1){
    showErrorMessage("Error downloading a folder", "Multiple selections for archiving a folder is not supported.");
    return;
  }
  const path = items[0].path;

  const settings = ServerConnection.makeSettings();
  let baseUrl = settings.baseUrl;

  let url = URLExt.join(baseUrl, API, URLExt.encodeParts(path));
  let queryArgs: JSONObject = {
    format: FORMAT
  }
  const xsrfTokenMatch = document.cookie.match('\\b_xsrf=([^;]*)\\b');
  if (xsrfTokenMatch) {
    queryArgs['_xsrf'] = xsrfTokenMatch[1]
  }
  url += URLExt.objectToQueryString(queryArgs);

  let element = document.createElement('a');
  document.body.appendChild(element);
  element.setAttribute('href', url);
  // Chrome doesn't get the right name automatically
  const parts = path.split('/');
  const name = parts[parts.length - 1] + "." + FORMAT;
  element.setAttribute('download', name);
  element.click();
  document.body.removeChild(element);

  /*
  let crumbs = document.getElementsByClassName("jp-BreadCrumbs-item");
  let dir = crumbs[crumbs.length - 1].getAttribute("title");
  let zipPath = dir;
  
  let request = new XMLHttpRequest();
  request.open("GET", fullUrl, true);
  request.setRequestHeader(
    "Content-Type",
    "application/x-www-form-urlencoded; charset=UTF-8"
  );
  request.responseType = "blob";
  request.onload = function() {
    // Only handle status code 200
    if (request.status === 200) {
      // Try to find out the filename from the content disposition `filename` value
      let disposition = request.getResponseHeader("content-disposition");
      let matches = /"([^"]*)"/.exec(disposition);
      let filename = matches != null && matches[1] ? matches[1] : "file.pdf";
      // The actual download
      let blob = new Blob([request.response], {
        type: "application/octet-stream"
      });
      let link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  request.send();
  */
}

/**
 * Initialization data for the jupyterlab-download-folder extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: "jupyterlab-download-folder",
  autoStart: true,
  activate: (app: JupyterFrontEnd, factory: IFileBrowserFactory) => {
    const { commands } =app;

    commands.addCommand(CommandIDs.downloadFolder, {
      execute: () => {zipAndDownload(factory.defaultBrowser)},
      iconClass: 'jp-SaveIcon jp-Icon jp-Icon-16',
      label: "Download folder as archive"
    })

    app.contextMenu.addItem({
      command: CommandIDs.downloadFolder,
      selector: '.jp-DirListing-item[data-isdir="true"]',
      rank: Infinity
    })
  },
  requires: [IFileBrowserFactory]
};

export default extension;
