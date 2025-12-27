import React, { use } from 'react';
import './App.css';
import { LoginRegister } from './LoginRegisterComponent';
import GridView, {ItemProps} from './GridViewComponent';
import { login } from './Account.service';
import { retrieveFolderList, retrieveFileList, createAndUploadFile } from './FileAndFolder.service';

interface BreadCrumb {
  name: string;
  folderId: string;
}

function App() {
  let [showPopup, setShowPopup] = React.useState(false);
  let [authUser, setAuthUser] = React.useState<any>(null);
  let [currentFolder, setCurrentFolder] = React.useState<string|null>(null);
  let [breadCrumb, setBreadcrumb] = React.useState<BreadCrumb[]>([]);
  let [folders, setFolders] = React.useState<ItemProps[]>([]);
  let [files, setFiles] = React.useState<ItemProps[]>([]);
  let [showUploadDialog, setShowUploadDialog] = React.useState(false);
  let [uploadFile, setUploadFile] = React.useState<File|null>(null);

  const logout = () => {
    setAuthUser(null);
    localStorage.removeItem("authenticatedUser");
    setFolders([]);
    setFiles([]);
    setCurrentFolder(null);
    setBreadcrumb([]);
  }

  const changeFolder = async (folderId: string, breadCrumbAddition?: string) => {
    setCurrentFolder(folderId);
    if(breadCrumbAddition){
      setBreadcrumb(prev => [...prev, {name: breadCrumbAddition, folderId: folderId}]);
    }

    let folders = await retrieveFolderList(folderId);
    setFolders(folders.map((item=> ({id: item.id, title: item.title, description: item.description, data: "FOLDER"}))));
    let files = await retrieveFileList(folderId)
    setFiles(files.map((item=> ({id: item.id, title: item.title, description: item.description}))));
  }

  const moveBackToFolder = async (folderId: string) => {
    let index = breadCrumb.findIndex(i => i.folderId === folderId);
    if(index !== -1){
      setBreadcrumb(prev => prev.slice(0, index + 1));
      await changeFolder(folderId);
    }
  }  

  React.useEffect(() => {
    let storedUser = localStorage.getItem("authenticatedUser");
    if (storedUser) {
      let authenticatedUser = JSON.parse(storedUser);
      setAuthUser(authenticatedUser);
      changeFolder(authenticatedUser.user.folderId).catch((error) => {
        console.error("Failed to change folder on app load", error);
        if (error.response && error.response.status === 401) {
          logout();
        }
      });
      setBreadcrumb([{name: `${authenticatedUser.user.username}'s Home`, folderId: authenticatedUser.user.folderId}]);
    }
  }, []);

  const handleLoginRegister = async (args: {register: Boolean, username: string, password: string, emailAddress: string}) => {
    if(args.register) {
      console.log("Registering user:", args.username, args.emailAddress);
    } else {
      console.log("Logging in user:",  args.username);
      try{ 
        let authenticatedUser = await login(args.username, args.password);
        setAuthUser(authenticatedUser);
        console.log("Login successful");
        setShowPopup(false);
        localStorage.setItem("authenticatedUser", JSON.stringify(authenticatedUser));
        await changeFolder(authenticatedUser.user.folderId)
      } catch (error) {
        setAuthUser(null);
        localStorage.removeItem("authToken");
        console.error("Login failed", error);
        // show toast notification to user
      }
    }
  }

  const uploadFileHandler = async () => {
    if(!uploadFile || !authUser || !currentFolder) return;
    await createAndUploadFile(currentFolder, uploadFile);
    setShowUploadDialog(false);
    setUploadFile(null);
    await changeFolder(currentFolder); // Refresh file list
  }

  return (
    <div className="App">
      <header>
        {authUser ? (<div onClick={() => logout()}>Welcome, {authUser.user.username}!</div> ) : 
        <div><button onClick={() => setShowPopup(true)}>Login/Register</button>
        {showPopup && 
            <LoginRegister onClose={() => setShowPopup(false)} onSubmit={(props: any) => handleLoginRegister(props)}/>
        }
        </div>
        }
        <div className="menu">
          <span className="menu-item" onClick={() => setShowUploadDialog(true)}>Upload</span>
          {showUploadDialog && 
            <div className="dialog">
              <div className="dialog-content">
                <h3>Upload File</h3>
                <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                <button className="button button-primary" onClick={() => uploadFileHandler()}>Upload</button>
                <button className="button button-secondary" onClick={() => setShowUploadDialog(false)}>Close</button>
              </div>
            </div>
          }
        </div>
      </header>
      {currentFolder && <div className="breadcrumb">Current Folder: {breadCrumb.map((i) => <span key={i.folderId} className="breadcrumb-item" title={i.folderId} onClick={() => moveBackToFolder(i.folderId)}>{i.name}</span>)}</div>}
      <GridView items={[...folders, ...files]} itemSelected={(item: ItemProps) => item.data == "FOLDER" ? changeFolder(item.id, item.title) : console.log("Selected file:", item.id)}/>
    </div>
  );
}

export default App;
