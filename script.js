document.addEventListener('DOMContentLoaded', function() {
    // عناصر DOM
    const gameSetup = document.getElementById('game-setup');
    const gameWrapper = document.getElementById('game-wrapper');
    const gameModeDisplay = document.getElementById('game-mode-display');
    const playerNamesDiv = document.getElementById('player-names');
    const board = document.getElementById('chess-board');
    const boardMatrix = document.getElementById('board-matrix');
    const whiteTimeDisplay = document.getElementById('white-time');
    const blackTimeDisplay = document.getElementById('black-time');
    const currentTurnDisplay = document.getElementById('current-turn');
    const moveCountDisplay = document.getElementById('move-count');
    const boardStatus = document.getElementById('board-status');
    const whiteCaptured = document.getElementById('white-captured');
    const blackCaptured = document.getElementById('black-captured');
    const whitePlayerName = document.getElementById('white-player-name');
    const blackPlayerName = document.getElementById('black-player-name');
    const gameTypeDisplay = document.getElementById('game-type');
    
    // أزرار التحكم
    const modeCards = document.querySelectorAll('.mode-card');
    const startGameBtn = document.getElementById('start-game-btn');
    const player1NameInput = document.getElementById('player1-name');
    const player2NameInput = document.getElementById('player2-name');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const helpBtn = document.getElementById('help-btn');
    const hintBtn = document.getElementById('hint-btn');
    const backBtn = document.getElementById('back-btn');
    const instructionsModal = document.getElementById('instructions-modal');
    const resultModal = document.getElementById('result-modal');
    const closeModal = document.querySelector('.close-modal');
    const playAgainBtn = document.getElementById('play-again-btn');
    const mainMenuBtn = document.getElementById('main-menu-btn');
    
    // متغيرات اللعبة
    let gameState = 'setup'; // setup, active, paused, finished
    let gameMode = 'computer'; // computer, multiplayer
    let currentPlayer = 'white';
    let selectedSquare = null;
    let boardState = [];
    let moveCount = 1;
    let whiteTime = 600;
    let blackTime = 600;
    let timerInterval = null;
    let gameStartTime = null;
    let enPassantTarget = null;
    let gameHistory = [];
    
    // معلومات اللاعبين
    let players = {
        white: { name: 'الأبيض', type: 'human' },
        black: { name: 'الأسود', type: 'computer' }
    };
    
    // رموز القطع
    const pieces = {
        white: {
            king: { symbol: '♔', name: 'الملك', value: 0 },
            queen: { symbol: '♕', name: 'الوزير', value: 9 },
            rook: { symbol: '♖', name: 'الطابية', value: 5 },
            bishop: { symbol: '♗', name: 'الفيل', value: 3 },
            knight: { symbol: '♘', name: 'الحصان', value: 3 },
            pawn: { symbol: '♙', name: 'البيدق', value: 1 }
        },
        black: {
            king: { symbol: '♚', name: 'الملك', value: 0 },
            queen: { symbol: '♛', name: 'الوزير', value: 9 },
            rook: { symbol: '♜', name: 'الطابية', value: 5 },
            bishop: { symbol: '♝', name: 'الفيل', value: 3 },
            knight: { symbol: '♞', name: 'الحصان', value: 3 },
            pawn: { symbol: '♟', name: 'البيدق', value: 1 }
        }
    };
    
    // ----------------------------
    // إعدادات اللعبة - الإصلاح هنا
    // ----------------------------
    
    // اختيار نوع اللعبة - إضافة حدث لكل بطاقة
    modeCards.forEach(card => {
        card.addEventListener('click', function() {
            const mode = this.dataset.mode;
            
            // تجاهل إذا كان غير مفعل
            if (mode === 'online') {
                return; // غير مفعل بعد
            }
            
            // إزالة التحديد من جميع البطاقات
            modeCards.forEach(c => {
                c.classList.remove('selected');
            });
            
            // تحديد البطاقة المختارة
            this.classList.add('selected');
            gameMode = mode;
            
            // تحديث عرض أسماء اللاعبين
            updatePlayerNamesDisplay();
            
            console.log('تم اختيار وضع اللعب:', mode);
        });
    });
    
    // تحديث عرض أسماء اللاعبين
    function updatePlayerNamesDisplay() {
        if (gameMode === 'multiplayer') {
            playerNamesDiv.style.display = 'block';
            players.black.type = 'human';
            
            // تحديث القيم الافتراضية
            player2NameInput.value = 'الأسود';
            player2NameInput.placeholder = 'أدخل اسم اللاعب الثاني';
        } else {
            playerNamesDiv.style.display = 'none';
            players.black.type = 'computer';
            players.black.name = 'الكمبيوتر';
        }
    }
    
    // بدء اللعبة - إصلاح الحدث
    startGameBtn.addEventListener('click', function() {
        console.log('بدء اللعبة - الوضع:', gameMode);
        
        // التحقق من صحة الأسماء
        if (gameMode === 'multiplayer') {
            const player1Name = player1NameInput.value.trim();
            const player2Name = player2NameInput.value.trim();
            
            players.white.name = player1Name || 'الأبيض';
            players.black.name = player2Name || 'الأسود';
        } else {
            players.white.name = 'الأبيض';
            players.black.name = 'الكمبيوتر';
        }
        
        // تحديث عرض الأسماء
        whitePlayerName.textContent = players.white.name;
        blackPlayerName.textContent = players.black.name;
        
        // تحديث نوع اللعبة
        gameTypeDisplay.textContent = gameMode === 'computer' ? 'ضد الكمبيوتر' : 'لعب ثنائي';
        
        // تحديث شريط العنوان
        updateGameModeDisplay();
        
        // الانتقال إلى واجهة اللعب
        gameSetup.style.display = 'none';
        gameWrapper.style.display = 'block';
        
        // بدء اللعبة
        setTimeout(() => {
            resetGame();
        }, 100);
    });
    
    // تحديث عرض نوع اللعبة
    function updateGameModeDisplay() {
        if (gameMode === 'computer') {
            gameModeDisplay.innerHTML = '<i class="fas fa-robot"></i><span>ضد الكمبيوتر</span>';
        } else {
            gameModeDisplay.innerHTML = '<i class="fas fa-users"></i><span>لعب ثنائي</span>';
        }
    }
    
    // العودة للقائمة الرئيسية
    backBtn.addEventListener('click', function() {
        if (confirm('هل تريد العودة للقائمة الرئيسية؟ سيتم فقدان تقدم اللعبة الحالية.')) {
            gameWrapper.style.display = 'none';
            gameSetup.style.display = 'block';
            clearInterval(timerInterval);
            gameState = 'setup';
        }
    });
    
    // ----------------------------
    // باقي الكود يبقى كما هو مع تعديلات بسيطة
    // ----------------------------
    
    // تهيئة لوحة الشطرنج
    function initBoard() {
        board.innerHTML = '';
        boardState = [];
        
        // إعداد الأحرف العربية للوحة
        const columns = ['أ', 'ب', 'ج', 'د', 'ه', 'و', 'ز', 'ح'];
        const rows = ['8', '7', '6', '5', '4', '3', '2', '1'];
        
        for (let row = 0; row < 8; row++) {
            boardState[row] = [];
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                square.dataset.coord = columns[col] + rows[row];
                
                // وضع القطع في مواضعها الابتدائية
                let pieceData = null;
                
                // الصف 0: القطع السوداء
                if (row === 0) {
                    if (col === 0 || col === 7) pieceData = pieces.black.rook;
                    else if (col === 1 || col === 6) pieceData = pieces.black.knight;
                    else if (col === 2 || col === 5) pieceData = pieces.black.bishop;
                    else if (col === 3) pieceData = pieces.black.queen;
                    else if (col === 4) pieceData = pieces.black.king;
                }
                // الصف 1: بيادق سوداء
                else if (row === 1) {
                    pieceData = pieces.black.pawn;
                }
                // الصف 6: بيادق بيضاء
                else if (row === 6) {
                    pieceData = pieces.white.pawn;
                }
                // الصف 7: القطع البيضاء
                else if (row === 7) {
                    if (col === 0 || col === 7) pieceData = pieces.white.rook;
                    else if (col === 1 || col === 6) pieceData = pieces.white.knight;
                    else if (col === 2 || col === 5) pieceData = pieces.white.bishop;
                    else if (col === 3) pieceData = pieces.white.queen;
                    else if (col === 4) pieceData = pieces.white.king;
                }
                
                if (pieceData) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `piece ${pieceData.name}`;
                    pieceElement.textContent = pieceData.symbol;
                    pieceElement.dataset.type = pieceData.name;
                    pieceElement.dataset.color = row < 2 ? 'black' : 'white';
                    pieceElement.dataset.value = pieceData.value;
                    square.appendChild(pieceElement);
                    
                    boardState[row][col] = {
                        piece: pieceData.symbol,
                        type: pieceData.name,
                        color: row < 2 ? 'black' : 'white',
                        value: pieceData.value,
                        hasMoved: false
                    };
                } else {
                    boardState[row][col] = null;
                }
                
                // إضافة حدث النقر
                square.addEventListener('click', () => handleSquareClick(row, col));
                board.appendChild(square);
            }
        }
        
        // تحديث مصفوفة الرقعة
        updateBoardMatrix();
    }
    
    // تحديث مصفوفة الرقعة
    function updateBoardMatrix() {
        boardMatrix.innerHTML = '';
        const columns = ['أ', 'ب', 'ج', 'د', 'ه', 'و', 'ز', 'ح'];
        const rows = ['8', '7', '6', '5', '4', '3', '2', '1'];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = `matrix-cell ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                
                const piece = boardState[row][col];
                if (piece) {
                    cell.classList.add('has-piece');
                    const pieceSpan = document.createElement('span');
                    pieceSpan.className = `matrix-piece ${piece.type}`;
                    pieceSpan.textContent = piece.piece;
                    pieceSpan.title = `${piece.type} ${piece.color}`;
                    cell.appendChild(pieceSpan);
                }
                
                // إحداثيات الزاوية
                const coordSpan = document.createElement('span');
                coordSpan.className = 'matrix-coord';
                coordSpan.textContent = columns[col] + rows[row];
                cell.appendChild(coordSpan);
                
                boardMatrix.appendChild(cell);
            }
        }
    }
    
    // التعامل مع نقر المربع
    function handleSquareClick(row, col) {
        if (gameState !== 'active') return;
        
        // التحقق إذا كان دور الكمبيوتر
        if (gameMode === 'computer' && currentPlayer === 'black' && players.black.type === 'computer') {
            boardStatus.innerHTML = `<i class="fas fa-robot"></i><span>دور ${players.black.name}...</span>`;
            return;
        }
        
        const square = boardState[row][col];
        
        // إذا كان هناك مربع محدد بالفعل
        if (selectedSquare) {
            const [selectedRow, selectedCol] = selectedSquare;
            
            // إذا نقرنا على نفس المربع، نلغي التحديد
            if (selectedRow === row && selectedCol === col) {
                clearSelection();
                return;
            }
            
            // محاولة تحريك القطعة
            if (isValidMove(selectedRow, selectedCol, row, col)) {
                // حفظ الحركة في التاريخ
                gameHistory.push({
                    from: { row: selectedRow, col: selectedCol },
                    to: { row, col },
                    piece: boardState[selectedRow][selectedCol],
                    captured: boardState[row][col]
                });
                
                movePiece(selectedRow, selectedCol, row, col);
                moveCount++;
                moveCountDisplay.textContent = moveCount;
                
                // تغيير الدور
                currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
                updatePlayerDisplay();
                
                clearSelection();
                
                // التحقق من نهاية اللعبة
                if (isCheckmate()) {
                    showResult(`${currentPlayer === 'white' ? players.black.name : players.white.name} يفوز بكش مات!`);
                    return;
                }
                
                if (isStalemate()) {
                    showResult('تعادل!');
                    return;
                }
                
                // إذا كان دور الكمبيوتر
                if (gameMode === 'computer' && currentPlayer === 'black' && players.black.type === 'computer') {
                    setTimeout(makeComputerMove, 800);
                }
            } else {
                // إذا نقرنا على قطعة من اللون الحالي، نحددها
                if (square && square.color === currentPlayer) {
                    selectSquare(row, col);
                } else {
                    clearSelection();
                }
            }
        } else {
            // تحديد قطعة جديدة
            if (square && square.color === currentPlayer) {
                selectSquare(row, col);
            }
        }
    }
    
    // التحقق من صحة الحركة
    function isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = boardState[fromRow][fromCol];
        if (!piece || piece.color !== currentPlayer) return false;
        
        const target = boardState[toRow][toCol];
        if (target && target.color === currentPlayer) return false;
        
        const rowDiff = toRow - fromRow;
        const colDiff = toCol - fromCol;
        
        // حركة الملك
        if (piece.type === 'الملك') {
            return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;
        }
        
        // حركة الوزير
        if (piece.type === 'الوزير') {
            return isClearPath(fromRow, fromCol, toRow, toCol) && 
                   (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff));
        }
        
        // حركة الطابية
        if (piece.type === 'الطابية') {
            return (rowDiff === 0 || colDiff === 0) && isClearPath(fromRow, fromCol, toRow, toCol);
        }
        
        // حركة الفيل
        if (piece.type === 'الفيل') {
            return Math.abs(rowDiff) === Math.abs(colDiff) && isClearPath(fromRow, fromCol, toRow, toCol);
        }
        
        // حركة الحصان
        if (piece.type === 'الحصان') {
            return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) || 
                   (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2);
        }
        
        // حركة البيدق
        if (piece.type === 'البيدق') {
            const direction = piece.color === 'white' ? -1 : 1;
            const startRow = piece.color === 'white' ? 6 : 1;
            
            // حركة عادية للأمام
            if (colDiff === 0 && !target) {
                if (rowDiff === direction) return true;
                if (rowDiff === 2 * direction && fromRow === startRow && !boardState[fromRow + direction][fromCol]) {
                    return true;
                }
            }
            
            // أخذ قطعة
            if (Math.abs(colDiff) === 1 && rowDiff === direction) {
                if (target) return true;
            }
        }
        
        return false;
    }
    
    // التحقق من أن المسار خالي
    function isClearPath(fromRow, fromCol, toRow, toCol) {
        const rowStep = Math.sign(toRow - fromRow);
        const colStep = Math.sign(toCol - fromCol);
        
        let row = fromRow + rowStep;
        let col = fromCol + colStep;
        
        while (row !== toRow || col !== toCol) {
            if (boardState[row][col]) return false;
            row += rowStep;
            col += colStep;
        }
        
        return true;
    }
    
    // تحديد مربع
    function selectSquare(row, col) {
        clearSelection();
        
        selectedSquare = [row, col];
        const squareElement = getSquareElement(row, col);
        squareElement.classList.add('selected');
        
        // إظهار الحركات الممكنة
        showPossibleMoves(row, col);
        
        const piece = boardState[row][col];
        boardStatus.innerHTML = `<i class="fas fa-chess-${getPieceIcon(piece.type)}"></i>
                                <span>محدد: ${piece.type} ${players[piece.color].name}</span>`;
    }
    
    // الحصول على أيقونة القطعة
    function getPieceIcon(type) {
        const icons = {
            'الملك': 'king',
            'الوزير': 'queen',
            'الطابية': 'rook',
            'الفيل': 'bishop',
            'الحصان': 'knight',
            'البيدق': 'pawn'
        };
        return icons[type] || 'pawn';
    }
    
    // إظهار الحركات الممكنة
    function showPossibleMoves(row, col) {
        const piece = boardState[row][col];
        if (!piece) return;
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (isValidMove(row, col, r, c)) {
                    const squareElement = getSquareElement(r, c);
                    if (boardState[r][c]) {
                        squareElement.classList.add('possible-capture');
                    } else {
                        squareElement.classList.add('possible-move');
                    }
                }
            }
        }
    }
    
    // تحريك قطعة
    function movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = boardState[fromRow][fromCol];
        const target = boardState[toRow][toCol];
        
        // تسجيل الحركة
        piece.hasMoved = true;
        
        // أخذ القطعة
        if (target) {
            capturePiece(toRow, toCol, target);
        }
        
        // تحريك القطعة
        boardState[toRow][toCol] = piece;
        boardState[fromRow][fromCol] = null;
        
        // ترقية البيدق
        if (piece.type === 'البيدق' && (toRow === 0 || toRow === 7)) {
            promotePawn(toRow, toCol);
        }
        
        // تحديث الواجهة
        updateBoardDisplay();
        updateBoardMatrix();
        
        // رسالة النجاح
        boardStatus.innerHTML = `<i class="fas fa-check-circle"></i>
                                <span>${players[piece.color].name} حرك ${piece.type}</span>`;
        
        // صوت الحركة
        playMoveSound();
    }
    
    // ترقية البيدق
    function promotePawn(row, col) {
        const piece = boardState[row][col];
        const color = piece.color;
        
        // ترقية إلى وزير تلقائياً
        boardState[row][col] = {
            piece: color === 'white' ? pieces.white.queen.symbol : pieces.black.queen.symbol,
            type: 'الوزير',
            color: color,
            value: 9,
            hasMoved: 
