const chai = require('chai');
const PieceStore = require('../models/v2/PieceStore.js');
const UserStore = require('../models/v2/UserStore.js');
const BoardStore = require('../models/v2/BoardStore.js');
const app = require('../routes/app.js');

const basePath = '/api/v2';

async function setTestUsers(userList) {
  const testUsers = [];
  for (let i = 0; i < userList.length; i += 1) {
    const response = await chai.request(app)
      .post(`${basePath}/user_id_generate`)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ userName: userList[i] });
    testUsers.push(response.body);
  }
  return testUsers;
}

async function putPieces(pieceOrder) {
  for (let i = 0; i < pieceOrder.length; i += 1) {
    const response = await chai.request(app)
      .post(`${basePath}/piece/`)
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('Authorization', UserStore.getUserData({ userId: pieceOrder[i].userId }).accessToken)
      .send(pieceOrder[i]);
    // console.log('shin');
    // console.log(UserStore.getUserData({ userId: pieceOrder[i].userId }).accessToken);
    // console.log(pieceOrder[i]);
    console.log(response.body);
  }
}

async function makePlayOrder(pieces) {
  const array = [];
  const size = Math.sqrt(pieces.length);
  pieces.forEach((p, idx) => {
    if (!Array.isArray(p)) {
      if (p !== 0) {
        array.push({
          n: +p.split(':')[1],
          piece: {
            x: Math.floor(idx % size) - Math.floor(size / 2),
            y: Math.floor(idx / size) - Math.floor(size / 2),
            userId: `test${p.split(':')[0]}`,
          },
        });
      }
    } else {
      p.forEach((u) => {
        if (u !== 0) {
          array.push({
            n: +u.split(':')[1],
            piece: {
              x: Math.floor(idx % size) - Math.floor(size / 2),
              y: Math.floor(idx / size) - Math.floor(size / 2),
              userId: `test${u.split(':')[0]}`,
            },
          });
        }
      });
    }
  });
  return array.sort((a, b) => a.n - b.n).map(p => p.piece);
}


module.exports = {
  initTestParameter() {
    PieceStore.deletePieces();
    UserStore.deleteAllUserData();
    BoardStore.resetUserCounts();
  },

  array2PieceMatchers(array) {
    const size = Math.sqrt(array.length);
    return (array.map((p, idx) => (p !== 0 ? {
      x: Math.floor(idx % size) - Math.floor(size / 2),
      y: Math.floor(idx / size) - Math.floor(size / 2),
      userId: p,
    } : p))).filter(p => p !== 0);
  },

  array2CandidateMatchers(array) {
    const size = Math.sqrt(array.length);
    return (array.map((p, idx) => (p !== 0 ? {
      x: Math.floor(idx % size) - Math.floor(size / 2),
      y: Math.floor(idx / size) - Math.floor(size / 2),
    } : p))).filter(p => p !== 0);
  },

  setTesPieces(pieces) {
    const size = Math.sqrt(pieces.length);
    pieces.forEach((p, idx) => {
      if (p !== 0) {
        PieceStore.addPiece({
          x: Math.floor(idx % size) - Math.floor(size / 2),
          y: Math.floor(idx / size) - Math.floor(size / 2),
          userId: p,
        });
      }
    });
  },

  async setTestUsers(num) {
    const testUsers = [];
    for (let i = 0; i < num; i += 1) {
      const userName = `test${String(i)}`;
      const response = await chai.request(app)
        .post(`${basePath}/user_id_generate`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({ userName });
      testUsers.push(response.body);
    }
    return testUsers;
  },

  async setTesPieces2(pieces) {
    const pieceOrder = await makePlayOrder(pieces);
    await setTestUsers(pieceOrder.map(p => p.userId)
      .filter((x, i, self) => self.indexOf(x) === i));
    putPieces(pieceOrder.map(p => ({
      x: p.x,
      y: p.y,
      userId: UserStore.getUserData({ userName: p.userId }).userId,
    })));
    // pieceOrder.forEach((p) => {
    //   console.log(p.userId);
    //   console.log(UserStore.getUserData({ userName: p.userId }));
    //   console.log(UserStore.getUserData({ userName: p.userId }).userId);
    // });
    return PieceStore.getPieces();
    // pieceOrder.forEach(p => {
    //   p.userId = userLIst.forEach(u => u.userId === p.userId ? )
    //   p.userId = );
    // console.log(userList);
    // await setTestUsers('test0');
    // return pieceOrder = await makePlayOrder(pieces);
    // for (let i = 0; i < pieceOrder.length; i += 1) {
    //   const index = searchIndex(jwtIds, pieces[i].piece.userId);
    //   response = await chai.request(app)
    //     .post(`${basePath}`)
    //     .set('content-type', 'application/x-www-form-urlencoded')
    //     .set('Authorization', jwtIds[index].jwtId)
    //     .send(pieces[i].piece);
    // }
  },


};


// function makePlayOrder(pieces) {
//   const size = Math.sqrt(pieces.length);
//   return pieces.map((p, idx) => (Array.isArray(p) ? p : [p])
//     .map(u => (u === 0 ? 0 : {
//       n: +u.split(':')[1],
//       piece: {
//         x: Math.floor(idx % size) - Math.floor(size / 2),
//         y: Math.floor(idx / size) - Math.floor(size / 2),
//         userId: u.split(':')[0],
//       },
//     })).filter(e => e !== 0)).filter(e => e.length !== 0);
// }
