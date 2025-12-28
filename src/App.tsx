import React, { use } from 'react';
import './App.css';
import { LoginRegister } from './LoginRegisterComponent';
import GridView, {ItemProps} from './GridViewComponent';
import { login, registerUser } from './Account.service';
import { retrieveFolderList, retrieveFileList, createAndUploadFile } from './FileAndFolder.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';


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
  let [selectedItems, setSelectedItems] = React.useState<Set<ItemProps>>(new Set());
  let [showMenu, setShowMenu] = React.useState(false);

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
      try{
        let newUser = await registerUser(args.username, args.password, args.emailAddress);
      } catch (error) {
        console.error("Registration failed", error);
        // show toast notification to user
      }
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

  const handleClicked = (item: ItemProps) => {
    item.data == "FOLDER" ? changeFolder(item.id, item.title) : console.log("Clicked file:", item.id)
  }

  const handleSelected = (item: ItemProps, selected: boolean) => {
    setSelectedItems(prev => selected ? new Set([...Array.from(prev), item]) : new Set(Array.from(prev).filter(i => i !== item)));
  }

  const uploadFileHandler = async () => {
    if(!uploadFile || !authUser || !currentFolder) return;
    await createAndUploadFile(currentFolder, uploadFile);
    setShowUploadDialog(false);
    setUploadFile(null);
    await changeFolder(currentFolder); // Refresh file list
  }

  const handleMenu = (action: string) => {
    console.log("Handle menu option: ",action);
    setShowMenu(false);
  }

  return (
    <div className="App">
      <div className="floating-menu-icon"><FontAwesomeIcon icon={faBars} style={{ fontSize: 20, color: "white" }} onClick={() => setShowMenu(prev => !prev)}/></div>
      {showMenu && <div className="floating-menu">
        <span className="floating-menu-item" onClick={() => handleMenu("worksheets")}>Worksheets</span>
        <span className="floating-menu-item" onClick={() => handleMenu("documents")}>Documents</span>
        <span className="floating-menu-item" onClick={() => handleMenu("slides")}>Slides</span>
        <span className="floating-menu-item" onClick={() => handleMenu("photos")}>Photos</span>
        <span className="floating-menu-item" onClick={() => handleMenu("files")}>Files</span>
        <span className="floating-menu-item" onClick={() => handleMenu("tools")}>Advanced Tools</span>
        </div>}
      <header>
        {authUser ? (<div onClick={() => logout()}>Welcome, {authUser.user.username}!</div> ) : 
        <div><button onClick={() => setShowPopup(true)}>Login/Register</button>
        {showPopup && 
            <LoginRegister onClose={() => setShowPopup(false)} onSubmit={(props: any) => handleLoginRegister(props)}/>
        }
        </div>
        }
        <div className="menu">
          <span className="menu-item" onClick={() => changeFolder(authUser.user.folderId, `${authUser.user.username}'s Home`)}>Home</span>
          <span className={`menu-item ${selectedItems.size > 0 ? '' : 'menu-item-disabled'}`}>Share</span>
          <span className={`menu-item ${selectedItems.size > 0 ? '' : 'menu-item-disabled'}`}>Move To</span>
          <span className={`menu-item ${selectedItems.size > 0 ? '' : 'menu-item-disabled'}`}>Download</span>
          <span className="menu-item" onClick={() => setShowUploadDialog(true)}>Upload</span>
          {showUploadDialog && 
            <div className="dialog">
              <div className="dialog-content">
                <h3>Upload File</h3>
                <div 
                  className="drop-target" 
                  onDragOver={(e) => e.preventDefault()} 
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      setUploadFile(e.dataTransfer.files[0]);
                      e.dataTransfer.clearData();
                    }
                  }}
                >
                  {uploadFile ? uploadFile.name : "Drag and drop a file here"}
                </div>
                <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                <button className="button button-primary" onClick={() => uploadFileHandler()}>Upload</button>
                <button className="button button-secondary" onClick={() => setShowUploadDialog(false)}>Close</button>
              </div>
            </div>
          }
        </div>
      </header>
      {currentFolder && <div className="breadcrumb">Current Folder: {breadCrumb.map((i) => <span key={i.folderId} className="breadcrumb-item" title={i.folderId} onClick={() => moveBackToFolder(i.folderId)}>{i.name}</span>)}</div>}
      <GridView items={[...folders, ...files]} itemSelected={(item: ItemProps, selected: boolean) => handleSelected(item, selected)} itemClicked={(item: ItemProps) => handleClicked(item)}/>
    </div>
  );
}

export default App;
