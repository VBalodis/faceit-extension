import { render, screen, waitFor } from "@testing-library/react"
import AdminPage from "./page"
import "@testing-library/jest-dom"
import "@testing-library/user-event"
import userEvent from "@testing-library/user-event"

    const originalFetch = global.fetch

    afterEach(() => {
        global.fetch = originalFetch
    })

    test("unauthorized user sees login form", () => {
    render(<AdminPage />);

    const loginInput = screen.getByPlaceholderText("Login");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByRole("button", {name: "Log in"});

    expect(loginInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();

})

    test("user can type login and password", async() => {
        render(<AdminPage/>)

        const user = userEvent.setup()

        const loginUser = screen.getByPlaceholderText("Login")
        const passwordInput = screen.getByPlaceholderText("Password")
        const loginButton = screen.getByRole("button", {name: "Log in"})

        await user.type(loginUser, "Login")
        await user.type(passwordInput, "Password")

        expect(loginUser).toHaveValue("Login")
        expect(passwordInput).toHaveValue("Password")

    })

    test("Successful login sends request", async() => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true
        })
        global.fetch = mockFetch
        render(<AdminPage/>)
        const user = userEvent.setup()
        const loginButton = screen.getByRole("button", {name: "Log in"})
        const loginInput = screen.getByPlaceholderText("Login")
        const passwordInput = screen.getByPlaceholderText("Password")

        await user.type(loginInput, "admin")
        await user.type(passwordInput, "12345")
        await user.click(loginButton)
        await waitFor(() => {
            expect(screen.queryByPlaceholderText("Login")).not.toBeInTheDocument()
        })
        
        const adminPanel = await screen.findByText("Admin Panel")

        expect(mockFetch).toHaveBeenCalledWith(
        "/api/admin/login",
        expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
                login: "admin",
                password: "12345"
            })
        }))
        expect(adminPanel).toBeInTheDocument()
        expect(screen.getByRole("button", {name: "Logout"})).toBeInTheDocument()
    })
        test("wrong login and pass test", async() => {
            const mockFetch = jest.fn().mockResolvedValue({
                ok: false
            })
            global.fetch = mockFetch
            render(<AdminPage/>)
            const user = userEvent.setup()
            const loginButton = screen.getByRole("button", {name: "Log in"})
            const loginInput = screen.getByPlaceholderText("Login")
            const passwordInput = screen.getByPlaceholderText("Password")

            await user.type(loginInput, "admin")
            await user.type(passwordInput, "12345")
            await user.click(loginButton)

            const errorMessage = await screen.findByText("Wrong login or password")
            expect(errorMessage).toBeInTheDocument()
        })

        test("Admin can cancel", async () => {
            const mockFetch = jest.fn()
        .mockResolvedValueOnce({
            ok: true
        })
        .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
            submissions: [
                {
                    id: 1,
                    nickname: "TestPlayer",
                    reason: "Toxic behavior",
                    submitted_by: "Admin",
                    clip_url: "https://example.com/clip"
                }
            ]
        })
    })
            global.fetch = mockFetch
            render(<AdminPage/>)
            const user = userEvent.setup()
            const loginButton = screen.getByRole("button", {name: "Log in"})
            const loginInput = screen.getByPlaceholderText("Login")
            const passwordInput = screen.getByPlaceholderText("Password")


            await user.type(loginInput, "admin")
            await user.type(passwordInput, "12345")
            await user.click(loginButton)
            
            const showButton = await screen.findByRole("button", {name: "Show submissions"})
            await user.click(showButton)
            expect(await screen.findByText(/TestPlayer/)).toBeInTheDocument()
            const approvedButton = screen.getByRole("button", {name: "Approved"})
            await user.click(approvedButton)
            expect(await screen.findByText("Подтверждение")).toBeInTheDocument()
            const cancelButton = screen.getByRole("button", {name: "Отмена"})
            await user.click(cancelButton)
            expect(screen.queryByText("Подтверждение")).not.toBeInTheDocument()


            expect(mockFetch).toHaveBeenCalledWith(
            "/api/admin/login",
            expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
                login: "admin",
                password: "12345"
            })
        }))
        expect(mockFetch).toHaveBeenCalledTimes(2)
    })