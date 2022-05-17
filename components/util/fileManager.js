
const fs = require("react-native-fs"); 
 
const readFile = async (fileName) => {
      return await fs.readFile(fs.DocumentDirectoryPath+"/"+fileName+".txt", 'utf8').catch(err => console.log("From, err: "+ err))
};

const removeFile = (fileName) => {

    fs.unlink(fs.DocumentDirectoryPath+"/"+fileName+".txt")
    .then(() => {
      console.log('FILE DELETED');
    })
    // `unlink` will throw an error, if the item to unlink does not exist
    .catch((err) => {
      console.log(err.message);
    });

};

const writeFile = (fileName, content) => {

    fs.writeFile(fs.DocumentDirectoryPath+"/"+fileName+".txt", JSON.stringify(content), 'utf8')
    .then((success) => {
        console.log('FILE WRITTEN!');
    })
    .catch((err) => {
        console.log(err.message);
    });
    
};







export {writeFile, readFile, removeFile};
