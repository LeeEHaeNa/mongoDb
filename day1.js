db
// mydb 데이터베이스 생성 
use mydb
db
show dbs
//mydb에 collection을 생성해보자 
db.createCollection("employees",{capped:true,size:10000})
//capped:true ==> 저장공간이 차면 기존 공간을 재사용하겠다는 설정 
db
show collections
show dbs

db.employees.find()
db.employees.isCapped()
db.employees.stats()

db.employees.renameCollection("emp")
show collections //emp

//컬렉션 삭제 db.컬렉션이름.drop()
db.emp.drop()
show collections
// capped옵션 살펴보기---------------------------------
//컬렉션 생성
db.createCollection("cappedCollection",{capped:true,size:10000})
//capped:true => 최초 제한된 크기로 생성된 공간에서만 데이터를 저장하는 설정 
//size:10000 => 10000보다 크면서 가장 가까운 256배수로 maxsize가 설정된다 
show collections
db.cappedCollection.find()
db.cappedCollection.stats()

//도큐먼트(rows)를 size를 초과하도록 반복문 이용해서 넣어보자 
for(i=0; i<1000; i++){
     db.cappedCollection.insertOne({x:i})   
}
db.cappedCollection.find()
db.cappedCollection.find().count()
//처음 넣었던 데이터들이 사라진 것을 확인할 수 있다 
db.cappedCollection.isCapped()
//==============================
//CRUD


use mydb
db
db.createCollection('member')
show collections
db
db.member.find()
db.getCollection('member').find()
db.member.insertOne({
    name:'김민준',
    userid:'min',
    tel:'010-7878-8888',
    age:20
})
db.member.find()

/*
-id필드가 자동으로 생성된다. document의 유일성을 보장하는 키
    전체:12bytes
        4bytes: 현재 timestamp => 문서생성시점 
        3bytes: machine id 
        2bytes: 몽고디비 프로세스 id
        3bytes: 일련번호 
        
*/
db.member.insertOne({
    _id:1,//비권장
    name:'홍길동',
    userid:'hong',
    tel:'010-4545-4444',
    age:22

})

db.member.find()
//document를 bson으로 변환하여 몽고디비에 저장 
//_id: 자동으로 index가 생성 ==>검색빠름. 중복저장 불가 


db.member.insertMany([
    {name:'이민수',userid:'Lee',age:23},
    {name:'최민자',userid:'Choi',tel:'011-9999-8888',age:23},
    {name:'유재석',userid:'You',tel:'011-5999-5888',age:21}
])

db.getCollection("member").find()

db.member.insertOne({name:'표진우',userid:'Pyo',passwd:'123',grade:'A'})

db.user.insertMany([
    {_id:1,name:'김철',userid:'kim1',passwd:'1111'},
    {_id:2,name:'최철',userid:'choi1',passwd:'2111'}
])

db.user.find()
db.user.insertMany([
    {_id:3,name:'김철',userid:'kim1',passwd:'1111'},
    {_id:2,name:'최철',userid:'choi1',passwd:'2111'},
    {_id:5,name:'김철',userid:'kim1',passwd:'1111'}
],{ordered:false})

//ordered옵션의 기본값 true. 순서대로 insert할지 여부를 지정.
//false를 주면 순서대로 입력하지 않음 
//=> _id중복되어도 그 이후의 데이터를 삽입한다 

/*
[실습1]---------------------------------------------------------------------
1. boardDB생성
2. board 컬렉션 생성
3. board 컬렉션에 name 필드값으로 "자유게시판"을 넣어본다
4. article 컬렉션을 만들어 document들을 삽입하되,
   bid필드에 3에서 만든 board컬렉션 자유게시판의 _id값이 참조되도록 처리해보자.

5. 똑 같은 방법으로 "공지사항게시판"을 만들고 그 안에 공지사항 글을 작성하자.
--------------------------------------------------------------------------
*/

use boardDB
db
db.board.drop()
db.article.drop()

freeboard_res=db.board.insertOne({name:'자유게시판'})
//freeboard_res에는 자유게시판 도큐먼트의 _id값이 담긴다 

freeboard_id=freeboard_res.insertedId

db.article.insertMany([
    {bid:freeboard_id, title:'자유게시판 첫번째 글', content:'안녕하세요?', writer:'kim'},
    {bid:freeboard_id, title:'자유게시판 두번째 글', content:'반가워요', writer:'choi'},
    {bid:freeboard_id, title:'자유게시판 세번째 글', content:'Hello', writer:'lee'}
])

db.article.find()
//같은 방법으로 공지사항 게시판 
noticeboard_res=db.board.insertOne({name:'공지사항 게시판'})

noticeboard_id=noticeboard_res.insertedId

db.notice.insertMany([
    {bid:noticeboard_id, title:'가을', content:'이제 가고있네요', writer:'행인'},
    {bid:noticeboard_id, title:'마음', content:'눈왔으면 좋겠다', writer:'12월'},
    {bid:noticeboard_id, title:'과연', content:'어떻게 될까', writer:'좋은결과기대'}
])

db.notice.find()
db.article.find()


/* R: read 조회
    - findOne() : 매칭되는 1개의 document를 조회 
    - find() : 매칭되는 document list 조회 
      find({조건들},{필드들})
*/
use mydb

db.member.find({})
//select * from member

arr=db.member.find().toArray()
//모든 문서를 배열로 반환 
arr[0]
arr[1]
db.member.find()
//member에서 name, tel만 조회하고 싶다면 
db.member.find({},{name:true,tel:true,_id:false})
//select name, tel from member 


db.member.find({},{name:1,tel:1,_id:0})
//위 문장과 동일함 true=>1로, false:0으로 호환가능  

//select * from member where age=20

db.member.find({age:20},{})

//select name,userid,age from member where age=22
db.member.find({age:22},{name:1,userid:1,age:1})

//userid가 'You'이고 age:21인 회원정보를 가져와 출력하세요 
db.member.find()

db.member.find({userid:'You',age:21},{})

//age가 20 이거나 userid가 'You'인 회원정보를 보여주세요 
db.member.find({$or:[{age:20},{userid:'You'}]},{})
//select * from member where age=20 or userid='You'

//<1> userid가 'Choi'인 회원의 name, userid, tel 만 가져오기
db.member.find({userid:'Choi'},{name:1,userid:1,tel:1})
///<2> age가 21세 이거나 userid가 'Lee'인 회원정보 가져오기 
db.member.find({$or:[{age:21},{userid:'Lee'}]},{})
//<3> 이름이 이민수 이면서 나이가 23세인 회원정보 가져오기 
db.member.find({name:'이민수', age:23},{})
db.member.find({$and:[{name:'이민수'},{age:23}]})
//논리연산 
// $or: 배열 안 두 개 이상의 조건 중 하나라도 참인 경우를 반환 
// $and:  배열 안 두 개 이상의 조건이 모두 참인 경우를 반환 
// $nor: $or의 반대. 배열안 두 개 이상의 조건이 모두 아닌 경우를 반환함 

/*
[실습2]
1. emp Collection 생성 {capped:true, size:100000} Capped Collection, size는 100000 으로 생성
2. scott계정의 emp레코드를 mydb의 emp Document 데이터로 넣기 
  => insertOne()으로 3개 문서 삽입, 
     insertMany로 나머지 문서 삽입해보기
*/
db.mydb.find()
db.emp.drop()

db.createCollection('empinfo',{capped:true, size:100000})
db.getCollection('empinfo).find()
show collections
emp_res=db.empinfo.insertOne({name:'empDocument'})


db.empinfo.insertOne({empno:7369,ename:'SMITH',job:'CLERK',mgr:7902,hiredate:80/12/17,sal:800,deptno:20})
db.empinfo.find()

db.emp.drop()
var empArr=[
        {
                "empno" : "7499",
                "ename" : "ALLEN",
                "job" : "SALESMAN",
                "mgr" : "7698",
                "hiredate" : "1981-02-20",
                "sal" : "1600.00",
                "comm" : "300.00",
                "deptno" : "30"
        },
        {
                "empno" : "7521",
                "ename" : "WARD",
                "job" : "SALESMAN",
                "mgr" : "7698",
                "hiredate" : "1981-02-22",
                "sal" : "1250.00",
                "comm" : "500.00",
                "deptno" : "30"
        },
        {
                "empno" : "7654",
                "ename" : "MARTIN",
                "job" : "SALESMAN",
                "mgr" : "7698",
                "hiredate" : "1981-09-28",
                "sal" : "1250.00",
                "comm" : "1400.00",
                "deptno" : "30"
        },
        {
                "empno" : "7844",
                "ename" : "TURNER",
                "job" : "SALESMAN",
                "mgr" : "7698",
                "hiredate" : "1981-09-08",
                "sal" : "1500.00",
                "comm" : "0.00",
                "deptno" : "30"
              },

{"empno":7369, "ename":"SMITH","job":"CLERK",mgr:7902,"hiredate" : "1980-12-17","sal":800.0, "comm" : "0.00","deptno":20},
{"empno":7566, "ename":"JONES","job":"MANAGER",mgr:7839,"hiredate" : "1981-04-02","sal":2975.0, "comm" : "0.00","deptno":20.0},
{"empno":7782,"ename":"CLARK","job":"MANAGER",mgr:7839,"hiredate" : "1981-09-08","sal":2450.0, "comm" : "0.00","deptno":10.0},
{"empno":7934,"ename":"MILLER","job":"CLERK",mgr:7782,"hiredate" : "1981-09-08","sal":1300.0, "comm" : "0.00","deptno":10.0},
{"empno":7788,"ename":"SCOTT","job":"ANALYST",mgr:7566,"hiredate" : "1982-12-09","sal":3000.0, "comm" : "0.00","deptno":10.0},
{"empno":7839,"ename":"KING","job":"PRESIDENT","hiredate" : "1981-11-17","sal":5000.0, "comm" : "0.00","deptno":10.0},
{"empno":7876,"ename":"ADAMS","job":"CLERK",mgr:7788,"hiredate" : "1983-01-12","sal":1100.0, "comm" : "0.00","deptno":20.0},
{"empno":7902,"ename":"FORD","job":"ANALYST",mgr:7566,"hiredate" : "1981-12-03","sal":3000.0, "comm" : "0.00","deptno":20.0},
{"empno":7934,"ename":"MILLER","job":"CLERK",mgr:7782,"hiredate" : "1982-01-23","sal":1300.0, "comm" : "0.00","deptno":10.0}
]
db.emp.insertMany(empArr)

var deptArr=[{
                "deptno" : "10",
                "dname" : "ACCOUNTING",
                "loc" : "NEW YORK"
        },
        {
                "deptno" : "20",
                "dname" : "RESEARCH",
                "loc" : "DALLAS"
        },
        {
                "deptno" : "30",
                "dname" : "SALES",
                "loc" : "CHICAGO"
        },
        {
                "deptno" : "40",
                "dname" : "OPERATIONS",
                "loc" : "BOSTON"
        }
  ]
db.dept.insertMany(deptArr)

db.emp.insertMany(empArr)
db.emp.find()
db.dept.find()

db.emp.find({empno:7788},{ename:1,empno:1,job:1,_id:0})
//emp에서 사원의 이름과 급여를 가져와 보여주세요 

