const stage = document.getElementById("stage");
const audio1 = document.getElementById("audio1");
const audio2 = document.getElementById("audio2");
const audio3 = document.getElementById("audio3");
const squareTemplate = document.getElementById("square-template");
const stoneStateList = [];  //配列で石の状態を管理
let currentColor = 1;  //１と2
const currentTurnText = document.getElementById("current-turn");
const passButton = document.getElementById("pass");

const changeTurn = () => {
  currentColor = 3 - currentColor; //「1なら2」「2なら1」にする
  if (currentColor === 1) {
    currentTurnText.textContent = "あなたの番です";
  } else {
    currentTurnText.textContent = "相手の番です";
    setTimeout(CPU, 1000);
  }
}
const CPU = () => { //コンピューター
  let clickNums = []; //クリックできるマスのindex番号を入れる配列
  for (let i = 0; i < 64; i++) { //これ以降の処理を実行させない
    if (stoneStateList[i] !== 0 || !getReversibleStones(i).length) continue;
    clickNums.push(i);
  }
  let n = Math.floor(Math.random() * clickNums.length);
  onClickSquare(clickNums[n]);
}

function getReversibleStones(idx) {
  const squareNums = [
    7 - (idx % 8), //右に何マスあるか
    Math.min(7 - (idx % 8), (56 + (idx % 8) - idx) / 8), //右下に何マス

    //右のマス数      下のマス数
    (56 + (idx % 8) - idx) / 8, //下に何マス
    Math.min(idx % 8, (56 + (idx % 8) - idx) / 8), //左下に何マス
    idx % 8, //左に何マス
    Math.min(idx % 8, (idx - (idx % 8)) / 8), //左上に何マス
    (idx - (idx % 8)) / 8, //真上に何マス
    Math.min(7 - (idx % 8), (idx - (idx % 8)) / 8), //右上に何マス
  ];
  const parameters = [1, 9, 8, 7, -1, -9, -8, -7]; //隣のマスに行くため

  //右　右下　真下　左下　左　左上　真上　右上
  let results = []; //ひっくり返せると確定した石の番号を入れる配列
  for (let i = 0; i < 8; i++) { //8方向で調査
    const box = []; //ひっくり返せる可能性のある石の情報を入れる配列
    const squareNum = squareNums[i]; //現在調べている方向にいくつマスがあるか
    const param = parameters[i];
    const nextStoneState = stoneStateList[idx + param]; //ひとつ隣の石の状態

    //隣に石がない　　　　　or　　　　　自分の色　　　　　　　→　次のループへ　　　
    if (nextStoneState === 0 || nextStoneState === currentColor) continue;
    box.push(idx + param); //ひとつ隣の石のindex番号

    for (let j = 0; j < squareNum - 1; j++) { //さらにその延長戦
      const targetIdx = idx + param * 2 + param * j;
      //2回目　　　　次から足される
      const targetColor = stoneStateList[targetIdx];
      if (targetColor === 0) break; //その方向は石がないので終了
      if (targetColor === currentColor) { //自分の色なら仮ボックスの石がひっくり返せることが確定
        results = results.concat(box); //新しい配列を追加
        break;
      } else { //相手の色なら仮ボックスにその石の番号を格納
        box.push(targetIdx);
      }
    }
  }
  return results; //ひっくり返せると確定した石の番号を戻り値にする
}

const onClickSquare = (index) => {  //他の石(1or2)
  const reversibleStones = getReversibleStones(index); //ひっくり返せる石の数を取得
        //他の石（1or2）
  if (stoneStateList[index] !== 0 || !reversibleStones.length) {
    return;   //これ以降の処理を実行させない
  }
  //自分の石を置く
  stoneStateList[index] = currentColor;
  document.querySelector(`[data-index='${index}']`).setAttribute("data-state", currentColor);
  audio1.play();
  //相手の石をひっくり返す
  reversibleStones.forEach((key) => {
    stoneStateList[key] = currentColor;
    document.querySelector(`[data-index='${key}']`).setAttribute("data-state", currentColor);
  });
  //もし盤面がいっぱいだったら集計してゲームを終了する
  if (stoneStateList.every((state) => state !== 0)) { //すべてで0でない(1or2)なら真
    const blueNum = stoneStateList.filter(state => state === 1).length;
    const redNum = 64 - blueNum;
    let winnerText = "";
    if(blueNum > redNum) {
      winnerText = "YOU WIN";
      audio2.play();
    } else if (blueNum < redNum) {
      winnerText = "YOU LOSE";
      audio3.play();
    } else {
      winnerText = "DRAW";
    }
    setTimeout(
      () => { currentTurnText.textContent = `赤${redNum}、青${blueNum}で、${winnerText}`},
      2000
    );
  }

  changeTurn(); //ゲーム続行なら相手のターンにする
}
const createSquares = () => {
    for (let i = 0; i < 64; i++) {
      const square = squareTemplate.cloneNode(true); //クローンを作成 
      square.removeAttribute("id"); //idが重複しないように 
      stage.appendChild(square);  //盤に要素を追加
      //const stone = square.querySelector('.stone');
      //let defaultState;
      const stone = square.querySelector('.stone');
      let defaultState; // 0:何もなし 1:青2:赤
      if (i == 27 || i == 36) { //iの値によってデフォルトの石の状態を分岐する
        defaultState = 1; //青
      } else if (i == 28 || i == 35) {
        defaultState = 2; //赤
      } else {
        defaultState = 0;
      }
      stone.setAttribute("data-state", defaultState);
      stone.setAttribute("data-index", i); //インデックス番号をHTML要素に保持させる
      stoneStateList.push(defaultState); //初期値を配列に格納
      square.addEventListener('click', () => {
        onClickSquare(i);  //すべてにクリックイベントを登録
      });
    }
}

window.onload = () => {
    createSquares();
    passButton.addEventListener("click", changeTurn);
}