import React from 'react'

export default function DisableAdblockHelp() {
  return (
    <section className="container mx-auto px-6 py-12 max-w-3xl">
      <h1 className="text-3xl font-semibold text-heading">Disable your ad blocker for this site</h1>
      <p className="mt-4 text-body">
        Some calculator scripts are blocked by privacy extensions. Allow this site and retry from the prompt.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Quick steps</h2>
      <ol className="mt-3 list-decimal pl-6 text-body space-y-2">
        <li>Open your ad blocker extension icon.</li>
        <li>Choose allow-list/pause for this site.</li>
        <li>Refresh the page and click Retry.</li>
      </ol>
    </section>
  )
}
