export default function GUIPortfolio() {
    return (
      <main className="p-8 text-white bg-gray-800 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 border-b-2 border-green-500 pb-2">
            Graphical Portfolio
          </h2>
          <p className="text-lg">
            This is the GUI version of the portfolio, offering a more traditional web experience.
          </p>
          
          <section className="mt-8">
            <h3 className="text-2xl font-semibold text-green-400">About Me</h3>
            <p className="mt-2 text-gray-300">
              A placeholder section for a detailed biography, showcasing skills and experience in a visually appealing format.
            </p>
          </section>
  
          <section className="mt-8">
            <h3 className="text-2xl font-semibold text-green-400">Projects</h3>
            <p className="mt-2 text-gray-300">
              Projects would be displayed here as interactive cards with images, links, and descriptions.
            </p>
          </section>
        </div>
      </main>
    );
  }