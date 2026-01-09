import PublicLayout from "@/layouts/PublicLayout";
import { db } from "@/services/db";
import type { Event } from "@/types";
import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { zhTW } from "date-fns/locale";
import { format } from "date-fns";

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);

  useEffect(() => {
    setEvents(db.events.getAll());
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const target = format(selectedDate, "yyyy-MM-dd");
      const filtered = events.filter(e => {
          const start = e.startDate.split('T')[0];
          const end = e.endDate.split('T')[0];
          return target >= start && target <= end;
      });
      setSelectedEvents(filtered);
    } else {
        setSelectedEvents([]);
    }
  }, [selectedDate, events]);

  // Modifiers for calendar to show dots/highlights
  const eventDays = events.map(e => new Date(e.startDate));
  const modifiers = {
      hasEvent: (date: Date) => {
          const d = format(date, "yyyy-MM-dd");
          return events.some(e => {
              const start = e.startDate.split('T')[0];
              const end = e.endDate.split('T')[0];
              return d >= start && d <= end;
          });
      }
  };
  
  const modifiersStyles = {
      hasEvent: {
          fontWeight: 'bold',
          color: 'var(--ts-primary-500)',
          textDecoration: 'underline'
      }
  };

  return (
    <PublicLayout>
      <div className="ts-content is-tertiary is-fitted h-64 flex items-center justify-center mb-12">
          <div className="ts-header is-huge is-center-aligned">活動日曆</div>
      </div>

      <div className="ts-container is-narrow section-padding pb-12">
        <div className="ts-grid is-relaxed is-stackable">
            <div className="column is-6-wide">
                <div className="ts-box is-center-aligned p-4">
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        locale={zhTW}
                        modifiers={modifiers}
                        modifiersStyles={modifiersStyles}
                        styles={{
                            head_cell: { width: '40px' },
                            table: { maxWidth: 'none' },
                            day: { margin: 'auto' }
                        }}
                    />
                </div>
            </div>
            
            <div className="column is-10-wide">
                <div className="ts-header is-big mb-4">
                    {selectedDate ? format(selectedDate, "yyyy年MM月dd日", { locale: zhTW }) : "請選擇日期"} 的活動
                </div>
                
                {selectedEvents.length === 0 ? (
                    <div className="ts-placeholder is-secondary is-dashed">
                        <div className="header">本日無活動</div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {selectedEvents.map(event => (
                            <div key={event.id} className="ts-box">
                                <div className="ts-content">
                                    <div className="ts-header is-heavy">{event.title}</div>
                                    <div className="ts-meta is-secondary is-small mt-2 mb-3">
                                        <span className="ts-icon fa-regular fa-calendar mr-1"></span>
                                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                                        {event.location && (
                                            <>
                                                <span className="ts-icon fa-solid fa-location-dot ml-3 mr-1"></span>
                                                {event.location}
                                            </>
                                        )}
                                    </div>
                                    <p className="ts-text is-secondary">{event.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </PublicLayout>
  );
}
