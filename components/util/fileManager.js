
const fs = require("react-native-fs"); 
 
const readFile = async (fileName) => {
      return await fs.readFile(fs.DocumentDirectoryPath+"/"+fileName+".txt", 'utf8').catch(err => console.log("From, err: "+ err))
};

const writeFile = (fileName, content) => {

    fs.writeFile(fs.DocumentDirectoryPath+"/"+fileName+".txt", JSON.stringify(content), 'utf8')
    .catch((err) => {
        console.log(err.message);
    });
    
};


export {writeFile, readFile};
