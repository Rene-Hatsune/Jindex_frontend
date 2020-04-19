/**
 * js front end
 * 
 * 
 * Rene Hatsune
 * Yihao Sun <ysun67@syr.edu>
 */

// no idea why lodash change the name of this...
// and alais back
var foldl = _.reduce;

var resultJson = {
  "point-to-map": [
    ["(21 14)", "(25 17)"],
    ["(25 17)", "(30 14)"],
    ["(30 14)", "(14 9)"]
  ]
  ,
  "CFG": [
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
    ["(31 8)", "☠"]
  ],
  "IR": ""
};

// some code map look up and util function 
/** 
 * pred of a point
 * 
 */
function predPt(ptMap, point) {
  return foldl(
    ptMap,
    (res, p) => {
      if (p[1] === point) {
        res.push(p);
        return res;
      } else {
        return res;
      }
    },
    []
  );
}

/**
 * successor of a point
 */
function succPt(ptMap, point) {
  return foldl(
    ptMap,
    (res, p) => {
      if (p[0] === point) {
        res.push(p);
        return p;
      } else {
        return res;
      }
    },
    []
  );
}

/**
 console.log();
 * find all code point has path to a point
 * 
 * findRelated :: PointToMap -> Point -> [Point]
 */
function findRelated(ptMap, point) {
  let getAllPred = (pt) => {
    let next = predPt(ptMap, pt);
    return _.flattenDeep(_.map(next, getAllPred).concat(next));
  }

  let getAllSucc = (pt) => {
    let pre = predPt(ptMap, pt);
    return _.flattenDeep(_.map(pre, getAllSucc).concat(pre));  
  }
  let preds = getAllPred(point);
  let succs = getAllSucc(point);

  return _.union(preds, succs);
}

/**
 * change a CodeMirror point into sexpr pair `(,from ,to)
 */
function pointToString(pt) {
  let ln = pt.line + 1;
  let col = pt.ch;
  return `(${ln} ${col})`;
} 

function stringToPoint(ptS) {
  let ss = ptS.slice(1, -1).split(" ");
 // console.log(`${(parseInt(ss[0]) - 1)}`)
  return {line: (parseInt(ss[0]) - 1), ch: parseInt(ss[1])};
}

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

/**
 * start from here
 */

/**
 * Code panel initialization
 * 
 */
var codeMirror = CodeMirror(function (elt) {
  let editor = document.getElementById('editor');
  editor.parentNode.replaceChild(elt, editor);
}, {
  value: "void myScript(){return 100;}\n class Foo(){}\n",
  mode: "text/x-java",
  lineNumbers: true,
  readOnly: true,
  viewportMargin: Infinity,
  configureMouse: (cm, repeat, event) => {
    // view double/single click the same
    // trible click for line
    // and all even
    cm.getCursor("from");
    let u = "word";
    if (repeat === "triple") {
      u = "line";
    }
    return { unit: u };
  }
});

// register function on select
codeMirror.on("cursorActivity", (cm) => {
  let cur = cm.getCursor("from");
  console.log(cur);
});

/**
 * Handler for click on "Analyze" button
 * 
 * send code into backend using fetch
 * for demo just use fake URL here
 */
function handleSubmit() {
  // retriveJson(resultJson);
  // update code panel
  let code = document.getElementById("code").value;
  let position = document.getElementById("entry-point").value;
  codeMirror.setValue(code);
  fetch('http://localhost:8080/analyze', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ir: code,
      start: position
    }),
    mode: 'cors'
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      resultJson = data;
      console.log(data);
      // create listener on selection of code~
      codeMirror.on("cursorActivity", (cm) => {
        let currentCur = cm.getCursor("from");
        let cur = pointToString(cm.getCursor("from"));
        let related = findRelated(data['point-to-map'], cur);
        // related.push(cur);
        // put current selected always at last, so we can always select
        // it as primary
        // add selection for each relpts
        let relPts = _.map(related, stringToPoint);
        relPts.push(cm.getCursor("from"));
        let res = [];
        for (let i = 0; i < relPts.length; i++) {
          res.push(cm.findWordAt(relPts[i]));
        }
        cm.setSelections(res, (relPts.length - 1));
      })
    });
}




//turn input text into string array based on line number
str2Array = () => {
  let codeStr = document.getElementById("code").value;
  let lines = codeStr.split('\n');
  return lines;
}

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
