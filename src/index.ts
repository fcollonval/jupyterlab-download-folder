import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';


/**
 * Initialization data for the jupyterlab-download-folder extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-download-folder',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlab-download-folder is activated!');
  }
};

export default extension;
