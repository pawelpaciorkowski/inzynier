import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Reminder {
    id: number;
    note: string;
    user_id: number;
    remind_at: string;
}

export const useReminders = () => {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [shownReminders, setShownReminders] = useState<number[]>([]);
    const [lastCheckedDate, setLastCheckedDate] = useState<string>('');
    const { token } = useAuth();

    // Funkcja do resetowania pokazanych przypomnień każdego dnia
    const resetShownRemindersIfNewDay = useCallback(() => {
        const today = new Date().toDateString();
        if (lastCheckedDate !== today) {
            console.log('🔄 Nowy dzień - resetuję pokazane przypomnienia');
            console.log('  - Poprzedni dzień:', lastCheckedDate);
            console.log('  - Dzisiejszy dzień:', today);
            setShownReminders([]);
            setLastCheckedDate(today);
        }
    }, [lastCheckedDate]);

    // Pobieranie przypomnień z API
    const fetchReminders = useCallback(async () => {
        if (!token) return;

        try {
            console.log('🔄 Pobieram przypomnienia z API...');
            const response = await api.get('/Reminders');
            const data = response.data.$values || response.data;
            console.log('📥 Otrzymane przypomnienia:', data);
            setReminders(data);
        } catch (error) {
            console.error('❌ Błąd pobierania przypomnień:', error);
        }
    }, [token]);

    // Sprawdzanie czy jest przypomnienie na teraz
    const checkReminders = useCallback(() => {
        // Resetuj pokazane przypomnienia jeśli to nowy dzień
        resetShownRemindersIfNewDay();

        const now = new Date();
        const currentMinute = now.getMinutes();
        const currentHour = now.getHours();
        const currentDate = now.toDateString();

        console.log('=== SPRAWDZANIE PRZYPOMNIEŃ (MOBILE) ===');
        console.log('Aktualny czas:', currentHour + ':' + currentMinute, 'dnia:', currentDate);
        console.log('Liczba przypomnień w pamięci:', reminders.length);
        console.log('Pokazane przypomnienia:', shownReminders);

        if (reminders.length === 0) {
            console.log('Brak przypomnień do sprawdzenia');
            return;
        }

        const found = reminders.find(r => {
            if (shownReminders.includes(r.id)) {
                console.log('Przypomnienie', r.id, 'już pokazane - pomijam');
                return false;
            }

            const reminderDate = new Date(r.remind_at);
            const reminderMinute = reminderDate.getMinutes();
            const reminderHour = reminderDate.getHours();
            const reminderDateStr = reminderDate.toDateString();

            console.log('Sprawdzam przypomnienie ID:', r.id);
            console.log('  - Treść:', r.note);
            console.log('  - Czas przypomnienia:', reminderHour + ':' + reminderMinute, 'dnia:', reminderDateStr);

            // Sprawdź czy to ten sam dzień i ta sama godzina/minuta
            const dateMatches = reminderDateStr === currentDate;
            const hourMatches = reminderHour === currentHour;
            const minuteMatches = reminderMinute === currentMinute;

            console.log('  - Porównania:');
            console.log('    * Dzień pasuje:', dateMatches, `(${reminderDateStr} === ${currentDate})`);
            console.log('    * Godzina pasuje:', hourMatches, `(${reminderHour} === ${currentHour})`);
            console.log('    * Minuta pasuje:', minuteMatches, `(${reminderMinute} === ${currentMinute})`);

            const matches = dateMatches && hourMatches && minuteMatches;

            if (matches) {
                console.log('  ✅ ZNALEZIONO DOPASOWANIE!');
            } else {
                console.log('  ❌ Brak dopasowania');
            }

            return matches;
        });

        if (found) {
            console.log('🎉 Znaleziono przypomnienie do wyświetlenia:', found);

            // Wyświetl alert z przypomnieniem
            Alert.alert(
                '⏰ Przypomnienie!',
                found.note,
                [
                    {
                        text: 'OK',
                        style: 'default'
                    }
                ],
                { cancelable: true }
            );

            // Dodaj do pokazanych
            setShownReminders(prev => [...prev, found.id]);
        } else {
            console.log('Nie znaleziono żadnego przypomnienia do wyświetlenia');
        }
        console.log('=== KONIEC SPRAWDZANIA (MOBILE) ===');
    }, [reminders, shownReminders, resetShownRemindersIfNewDay]);

    // Effect do pobierania przypomnień co 2 minuty
    useEffect(() => {
        if (!token) return;

        fetchReminders();
        const interval = setInterval(fetchReminders, 2 * 60 * 1000); // 2 minuty
        return () => clearInterval(interval);
    }, [fetchReminders, token]);

    // Effect do sprawdzania przypomnień co minutę
    useEffect(() => {
        if (!token || reminders.length === 0) return;

        // Sprawdź od razu przy załadowaniu
        checkReminders();

        // Sprawdź co minutę
        const interval = setInterval(checkReminders, 60 * 1000);
        return () => clearInterval(interval);
    }, [checkReminders, token, reminders]);

    return {
        reminders,
        fetchReminders,
        shownReminders,
        checkReminders
    };
}; 