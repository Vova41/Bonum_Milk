import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "#f0f0f0" }}>
      <div
        className="w-full max-w-sm mx-4 rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}
      >
        {/* Top — black with logo */}
        <div className="flex flex-col items-center py-8 px-8" style={{ background: "#111111" }}>
          {/* BONUM logo (white on black) */}
          <svg width="99" height="66" viewBox="0 0 66 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0)">
              <path d="M8.921 20.95H2.232v-3.518h6.69v3.519zM66 15.19h-1.839c-.334 0-.668.159-.846.453l-4.011 6.72-4.012-6.72c-.178-.294-.512-.453-.846-.453h-.422a1.39 1.39 0 00-1.402 1.404V28.81h1.787a.46.46 0 00.438-.453V18.89l3.3 5.36c.245.249.511.453.845.453h.623c.334 0 .6-.204.845-.453l3.3-5.36v9.467c0 .249.2.453.445.453h1.335a.45.45 0 00.445-.453C66 23.963 66 19.577 66 15.19zm-15.388 0h-1.787a.46.46 0 00-.437.453v10.894h-6.69V15.643a.45.45 0 00-.444-.453h-1.335a.45.45 0 00-.445.453v13.159h9.766c.78 0 1.38-.611 1.38-1.404-.008-4.07-.008-8.139-.008-12.208zm-13.155 0H35.67a.46.46 0 00-.438.453v9.671l-6.266-9.67c-.2-.34-.556-.454-.846-.454h-.422c-.779 0-1.38.612-1.38 1.404V28.81h1.788a.46.46 0 00.437-.453V18.73l6.244 9.626c.2.34.556.453.846.453h.444c.78 0 1.387-.612 1.387-1.404-.007-4.077-.007-8.147-.007-12.216zm-13.156 0h-9.766c-.779 0-1.38.612-1.38 1.404v12.208h9.76c.778 0 1.379-.611 1.379-1.404.007-4.07.007-8.139.007-12.208zm-2.224 11.347h-6.69v-9.082h6.69v9.082zM0 28.81h8.81c1.29 0 2.343-1.042 2.343-2.318v-2.295c0-1.268-1.045-2.318-2.343-2.318v-.09c1.29 0 2.343-1.042 2.343-2.318v-1.978c0-1.269-1.045-2.318-2.343-2.318H.445a.45.45 0 00-.445.453V28.81zm51.962-17.365C48.292 4.628 41.18 0 33 0S17.709 4.628 14.038 11.445h2.625C20.097 5.95 26.126 2.303 33 2.303c6.874 0 12.903 3.646 16.337 9.142h2.625zM33 44c8.18 0 15.291-4.628 18.962-11.445h-2.625c-3.434 5.496-9.47 9.142-16.337 9.142-6.874 0-12.903-3.646-16.337-9.142h-2.625C17.708 39.372 24.82 44 33 44zM8.921 26.56H2.232v-3.813h6.69v3.813z" fill="white"/>
            </g>
            <defs>
              <clipPath id="clip0">
                <path fill="white" d="M0 0h66v44H0z"/>
              </clipPath>
            </defs>
          </svg>
          <p className="mt-3 text-xs tracking-widest font-medium" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "3px" }}>
            NEMILK
          </p>
        </div>

        {/* Bottom — white with form */}
        <div className="px-8 py-8" style={{ background: "#ffffff" }}>
          <h1 className="text-2xl font-bold text-center mb-6" style={{ color: "#111111" }}>
            Вход
          </h1>

          {/* Fields */}
          <div className="flex flex-col gap-3 mb-6">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#555555" }}>
                Логин
              </label>
              <input
                type="text"
                defaultValue="user@bonum.ru"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                style={{
                  background: "#f5f5f5",
                  border: "1px solid #d0d0d0",
                  color: "#111111",
                }}
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#555555" }}>
                Пароль
              </label>
              <input
                type="password"
                defaultValue="password123"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                style={{
                  background: "#f5f5f5",
                  border: "1px solid #d0d0d0",
                  color: "#111111",
                }}
                readOnly
              />
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "#e0e0e0" }} />
            <span className="text-xs" style={{ color: "#aaaaaa" }}>войти как</span>
            <div className="flex-1 h-px" style={{ background: "#e0e0e0" }} />
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href="/driver"
              className="w-full py-3 rounded-lg font-bold text-sm text-center transition-all duration-200"
              style={{ background: "#111111", color: "#ffffff" }}
            >
              Водитель
            </Link>
            <Link
              href="/dispatcher"
              className="w-full py-3 rounded-lg font-bold text-sm text-center transition-all duration-200"
              style={{ background: "#ffffff", color: "#111111", border: "2px solid #111111" }}
            >
              Диспетчер
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
