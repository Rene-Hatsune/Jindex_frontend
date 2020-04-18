var resultJson = {
  "point-to-map": [
    ["(21 14)", "(25 17)"],
    ["(25 17)", "(30 14)"],
    ["(30 14)", "(14 9)"],
  ],
  CFG: [
    ["(18 8)", "(18 8)"],
    ["(19 8)", "(20 8)"],
    ["(20 8)", "(21 8)"],
    ["(21 8)", "(26 8)"],
    ["(26 8)", "(27 8)"],
    ["(27 8)", "(28 8)"],
    ["(28 8)", "(9 8)"],
    ["(9 8)", "(29 8)"],
    ["(29 8)", "(30 8)"],
    ["(30 8)", "(31 8)"],
    ["(31 8)", "☠"],
  ],
  IR: "",
};

function changeColorMode() {
  let background = document.body;
  background.classList.toggle("dark-mode");
  let element = document.getElementById("nav");

  element.classList.toggle("navbar-dark");
  element.classList.toggle("bg-dark");
  let jumbo = document.getElementById("intro");
  jumbo.classList.toggle("intro-dark");
  let footer = document.getElementById("footer");
  footer.classList.toggle("footer-dark");
  let editor = document.getElementById("editor");
  editor.classList.toggle("bg-dark");
  let code = document.getElementById("code");
  code.classList.toggle("code-dark");
}

function getInputCode() {
  let input = document.getElementById("code").value;
  innerHTML = "<p>" + input + "</p>";
}

// document.getElementById("analyze").addEventListener('click', handleSubmit);

function uploadMultiFiles() {
  const formData = new FormData();
  const codeBlock = document.querySelector('input[type="file"][multiple]');

  formData.append("JavaCode", "JavaFile");
  for (let i = 0; i < codeBlock.files.length; i++) {
    formData.append("files", codeBlock.files[i]);
  }

  fetch("https://example.com/posts", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((result) => {
      console.log("Success:", result);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function postCode() {
  let entryPoint = document.getElementById("entry-point").value;
  let input = document.getElementById("code").value;
  const data = {
    entry: entryPoint,
    code: input,
  };

  fetch("https://example.com/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function getCoordinator() {
  fetch("http://example.com/test.json")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
    });
}

function handleSubmit() {
  retriveJson(resultJson);
  let input = str2Array();
}

//turn input text into string array based on line number
str2Array = () => {
  let codeStr = document.getElementById("code").value;
  let lines = codeStr.split("\n");
  return lines;
};

// massive mess, most of the things handle inside this funct
function retriveJson(resultJson) {
  let object = resultJson; //JSON.parse(res);
  let ptToMap = object["point-to-map"]; //[][]
  let cfg = object.CFG;
  let ir = object.IR;

  //pt2Map[0][0] -> 0 row 0 col string:"(21 14)""

  let lines = str2Array();
  // typeof(pt2Map[0][0]) -> string
  // let minX = lines.length;
  // let maxX = 0;

  let origin = [];
  let dest = [];
  let yO = [];
  let yD = [];

  for (let i = 0; i < ptToMap.length; i++) {
    let posO = ptToMap[i][0].split(" ");
    let posD = ptToMap[i][1].split(" ");
    origin.push([posO[0].match(/\d+/), posO[1].match(/\d+/)]);
    dest.push([posD[0].match(/\d+/), posD[1].match(/\d+/)]);
  }
  console.log(origin);
  console.log(dest);
  displayCodePanel(origin, dest);
}

locateKeyword = (lines, x, y) => {
  // x=21, y=17,counting start from 1, minus one for retrival
  let newX = x - 1;
  let newY = y - 1;
  let newStr = lines[newX].substring(newY); //0, newY
  // console.log(newStr);
  var newString = newStr.replace(/\W+/g, " ");
  var words = newString.split(" ");
  var selection = words[0]; //retrive first array item

  let posStart = newY;
  let posEnd = lines[newX].lastIndexOf(selection);
  console.log("word is " + selection);
  return posEnd;
};

displayCodePanel = (origin, dest) => {
  let codeLength = str2Array().length;
  let lines = str2Array();
  let content = "";
  let regContent = "";
  let keywordContent = "";
  for (let i = 0; i < codeLength; i++) {
    if (!origin.includes(i) && !dest.includes(i)) {
      regContent = displayRegCode(content, i);
      // console.log(regContent);
      content += regContent;
    } else {
      for (let j = 0; j < origin.length; j++) {
        if (origin[j][0] === i && dest[j][0] !== i) {
          let endY = locateKeyword(lines, origin[j][0], origin[j][1]);
          keywordContent = displayHighlighetedCode(i, origin[j][1], endY);
        }
        if (!origin[j][0] !== i && dest[j][0] === i) {
          let endY = locateKeyword(lines, dest[j][0], dest[j][1]);
          keywordContent = displayHighlighetedCode(i, dest[j][1], endY);
        }
        console.log(keywordContent);
        content += keywordContent;
      }
    }
  }
  document.getElementById("editor").innerHTML = content;
};

displayRegCode = (content, pos) => {
  let input = str2Array();
  content = "<p>" + input[pos] + "</p>";
  return content;
};

displayHighlighetedCode = (startX, startY, endY) => {
  let input = str2Array();
  let curLine = input[startX];
  let line = curLine.substring(0, startY);
  let selection = curLine.substring(startY, endY + 1);
  let restCode = curLine.substring(endY + 1);

  let highlightedLine =
    "<p>" + line + '<span class="hi ' + "0" + '" style="color:blue;"';
  selection + "</span>" + restCode + "</p>";
  console.log(highlightedLine);
  return highlightedLine;
};