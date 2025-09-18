import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

function App() {
  const [num, setNum] = useState(9999)
  return (
    <>
      <div className="text-center gap-4 h-screen flex-col w-screen justify-center items-center flex">
        <h2 className="font-bold text-4xl">
          {" "}
          REACT-Tailwind - shadcn ( setup with Vite )
        </h2>
        <h5 className="w-[60%]">
          This project was initially set up by pulling from a Git repository.
          It&apos;s designed to serve as a boilerplate for creating React
          applications using Tailwind CSS. What sets this boilerplate apart is
          its integration with Shadcn, enabling rapid development, compatibility
          with V0.dev&apos;s versatile AI engine, and seamless connectivity with
          backends. This combination creates a powerful foundation for building
          efficient, intelligent, and connected frontends.
        </h5>
        <div className="font-bold text-2xl">count</div>
        <div className="flex flex-row space-x-3">
          <div
            onClick={() => {
              setNum(num + 1)
            }}
          >
            <Button>-</Button>
          </div>
          <p className="font-bold text-xl">{num}</p>
          <div
            onClick={() => {
              setNum(num + 1)
            }}
          >
            <Button>+</Button>
          </div>
        </div>
        <Collapsible>
          <CollapsibleTrigger>Can I use this in my project?</CollapsibleTrigger>
          <CollapsibleContent>
            Yes. Free to use for personal and commercial projects. No
            attribution required.
            <br />
            <h1 className=" text-xl font-bold">
              For building 10x projects efficiently:
            </h1>
            <a className="text-blue-700" href="https://v0.dev">
              https://v0.dev
            </a>
            <br />
            <a className="text-blue-700" href="https://ui.shadcn.com">
              https://ui.shadcn.com
            </a>
            <div className="mt-4 flex flex-col items-center">
              <p className="mb-2">Thank you for using this boilerplate!</p>
              <p>
                This project has been very helpful for me. If you found it
                useful too, please consider leaving a star on the GitHub
                repository.
              </p>
              <button
                className="bg-slate-800 flex flex-row space-x-2 items-center hover:bg-slate-950  text-white font-bold py-2 px-4 rounded mt-2"
                onClick={() =>
                  window.open("https://github.com/AdarshCodeRealm", "_blank")
                }
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 0.296997C5.37 0.296997 0 5.67 0 12.297C0 17.6 3.438 22.097 8.205 23.682C8.805 23.795 9.025 23.424 9.025 23.105C9.025 22.82 9.015 22.065 9.01 21.065C5.672 21.789 4.968 19.455 4.968 19.455C4.422 18.07 3.633 17.7 3.633 17.7C2.546 16.956 3.717 16.971 3.717 16.971C4.922 17.055 5.555 18.207 5.555 18.207C6.625 20.042 8.364 19.512 9.05 19.205C9.158 18.429 9.467 17.9 9.81 17.6C7.145 17.3 4.344 16.268 4.344 11.67C4.344 10.36 4.809 9.29 5.579 8.45C5.444 8.147 5.039 6.927 5.684 5.274C5.684 5.274 6.689 4.952 8.984 6.504C9.944 6.237 10.964 6.105 11.984 6.099C13.004 6.105 14.024 6.237 14.984 6.504C17.264 4.952 18.269 5.274 18.269 5.274C18.914 6.927 18.509 8.147 18.389 8.45C19.154 9.29 19.619 10.36 19.619 11.67C19.619 16.28 16.814 17.295 14.144 17.59C14.564 17.95 14.954 18.686 14.954 19.81C14.954 21.416 14.939 22.706 14.939 23.096C14.939 23.411 15.149 23.786 15.764 23.666C20.565 22.092 24 17.592 24 12.297C24 5.67 18.627 0.296997 12 0.296997Z"
                    fill="white"
                  ></path>
                </svg>
                <p>Star on GitHub</p>
              </button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </>
  )
}

export default App
