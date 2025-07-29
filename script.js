document.addEventListener('DOMContentLoaded', () => {
        // State variables
        let selectedOrigin = null;
        let selectedDestination = null;
        let selectedTimeSlot = null;
        let selectedDate = null;

        // --- Element Selectors ---
        // Screen G1
        const originInput = document.getElementById('origin-station');
        const destinationInput = document.getElementById('destination-station');
        const stationCards = document.querySelectorAll('.station-card');
        const toScheduleBtnG1 = document.getElementById('to-schedule-btn');
        const stationSelectionGuide = document.getElementById('station-selection-guide');
        const selectionErrorMessage = document.getElementById('selection-error-message');
        
        // Screens
        const screenG1 = document.getElementById('screen-g1');
        const screenG2 = document.getElementById('screen-g2');
        const screenG3 = document.getElementById('screen-g3');
        const screenG4 = document.getElementById('screen-g4');

        // Screen G2
        const dateItems = document.querySelectorAll('.date-item');
        const timeSlotButtons = document.querySelectorAll('#screen-g2 .time-slot');
        const toConfirmBtnG2 = document.querySelector('#screen-g2 .btn-primary');

        // Screen G3 (Modal)
        const confirmBookingBtnG3 = document.querySelector('#screen-g3 .btn-primary');
        const cancelBookingBtnG3 = document.querySelector('#screen-g3 .btn-secondary');

        // --- UI Update Functions ---

        function updateG1UI() {
            if (!stationSelectionGuide) return; // Guard against elements not present
            // Update selection guide
            if (!selectedOrigin) {
                stationSelectionGuide.textContent = '出発駅を選択してください';
            } else if (!selectedDestination) {
                stationSelectionGuide.textContent = '到着駅を選択してください';
            } else {
                stationSelectionGuide.textContent = '選択完了';
            }

            // Update button state and error message
            if (selectedOrigin && selectedDestination) {
                const originLocker = selectedOrigin.dataset.lockerStatus;
                const originShower = selectedOrigin.dataset.showerStatus;
                const destLocker = selectedDestination.dataset.lockerStatus;
                const destShower = selectedDestination.dataset.showerStatus;

                const isOriginOk = originLocker !== 'unavailable' && originShower !== 'unavailable';
                const isDestOk = destLocker !== 'unavailable' && destShower !== 'unavailable';

                if (isOriginOk && isDestOk) {
                    toScheduleBtnG1.disabled = false;
                    selectionErrorMessage.textContent = '';
                } else {
                    toScheduleBtnG1.disabled = true;
                    let errorMessage = '選択した駅の施設に空きがないため、進めません。';
                    if (!isOriginOk && !isDestOk) {
                        errorMessage = `出発駅(${selectedOrigin.dataset.stationName})と到着駅(${selectedDestination.dataset.stationName})の施設に空きがありません。`;
                    } else if (!isOriginOk) {
                        errorMessage = `出発駅(${selectedOrigin.dataset.stationName})の施設に空きがありません。`;
                    } else if (!isDestOk) {
                        errorMessage = `到着駅(${selectedDestination.dataset.stationName})の施設に空きがありません。`;
                    }
                    selectionErrorMessage.textContent = errorMessage;
                }
            } else {
                toScheduleBtnG1.disabled = true;
                selectionErrorMessage.textContent = '出発駅と到着駅を選択してください。';
            }

            // Update card selection visual
            stationCards.forEach(card => {
                card.classList.remove('selected-origin', 'selected-destination');
                if (card === selectedOrigin) {
                    card.classList.add('selected-origin');
                } else if (card === selectedDestination) {
                    card.classList.add('selected-destination');
                }
            });
        }
        
        function updateG2UI() {
            toConfirmBtnG2.disabled = !(selectedDate && selectedTimeSlot);

            timeSlotButtons.forEach(button => {
                button.classList.remove('selected');
                if (button === selectedTimeSlot) {
                    button.classList.add('selected');
                }
            });
            
            dateItems.forEach(item => {
                item.classList.remove('active');
                if (item === selectedDate) {
                    item.classList.add('active');
                }
            });
        }

        // --- Event Handlers ---

        function handleStationCardClick(card) {
            const stationName = card.dataset.stationName;

            if (!selectedOrigin) {
                selectedOrigin = card;
                originInput.value = stationName;
            } else if (!selectedDestination && card !== selectedOrigin) {
                selectedDestination = card;
                destinationInput.value = stationName;
            } else if (card === selectedOrigin) {
                // Deselect origin
                selectedOrigin = null;
                originInput.value = '';
            } else if (card === selectedDestination) {
                // Deselect destination
                selectedDestination = null;
                destinationInput.value = '';
            } else { // Reset and select new origin
                selectedOrigin = card;
                selectedDestination = null;
                originInput.value = stationName;
                destinationInput.value = '';
            }
            updateG1UI();
        }

        function handleToScheduleClick() {
            if (!toScheduleBtnG1.disabled) {
                screenG1.style.display = 'none';
                screenG2.style.display = 'block';
                // Reset G2 state
                selectedDate = document.querySelector('.date-item.active');
                selectedTimeSlot = null;
                updateG2UI();
            }
        }
        
        function handleDateItemClick(item) {
            selectedDate = item;
            updateG2UI();
        }

        function handleTimeSlotClick(button) {
            if (button.dataset.status === 'unavailable') {
                return; 
            }
            if (selectedTimeSlot === button) {
                selectedTimeSlot = null; // Deselect if clicked again
            } else {
                selectedTimeSlot = button;
            }
            updateG2UI();
        }

        function handleToConfirmClick() {
            if (toConfirmBtnG2.disabled) return;

            const date = selectedDate.querySelector('.day').textContent;
            const dayOfWeek = selectedDate.querySelector('.day-of-week').textContent;
            const time = selectedTimeSlot.dataset.time;
            
            document.getElementById('g3-datetime').textContent = `2025年7月${date}日(${dayOfWeek}) ${time}`;
            document.getElementById('g3-origin-station').textContent = selectedOrigin.dataset.stationName;
            document.getElementById('g3-destination-station').textContent = selectedDestination.dataset.stationName;
            
            const getStatusSymbol = (status) => status === 'available' ? '○' : (status === 'partial' ? '△' : '×');
            document.getElementById('g3-locker-status').textContent = getStatusSymbol(selectedDestination.dataset.lockerStatus);
            document.getElementById('g3-shower-status').textContent = getStatusSymbol(selectedDestination.dataset.showerStatus);

            screenG3.style.display = 'flex';
        }

        function handleG3Cancel() {
            screenG3.style.display = 'none';
        }

        function handleG3Confirm() {
            alert('予約を確定しました！'); 
            
            screenG1.style.display = 'none';
            screenG2.style.display = 'none';
            screenG3.style.display = 'none';
            screenG4.style.display = 'block';
        }

        // --- Initialization ---
        
        function initializeApp() {
            updateG1UI();
            selectedDate = document.querySelector('.date-item.active');
            updateG2UI();

            stationCards.forEach(card => {
                card.addEventListener('click', () => handleStationCardClick(card));
            });
            
            toScheduleBtnG1.addEventListener('click', handleToScheduleClick);
            
            dateItems.forEach(item => {
                item.addEventListener('click', () => handleDateItemClick(item));
            });

            timeSlotButtons.forEach(button => {
                button.addEventListener('click', () => handleTimeSlotClick(button));
            });

            toConfirmBtnG2.addEventListener('click', handleToConfirmClick);

            cancelBookingBtnG3.addEventListener('click', handleG3Cancel);
            confirmBookingBtnG3.addEventListener('click', handleG3Confirm);
            
            screenG3.addEventListener('click', (event) => {
                if (event.target.id === 'screen-g3') {
                    handleG3Cancel();
                }
            });
        }

        initializeApp();
      });