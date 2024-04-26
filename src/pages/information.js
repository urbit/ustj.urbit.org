import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import IntraNav from "@/components/IntraNav";

export default function Information() {
  return (
    <>
      <Head>
        <title>urbitsystems.tech</title>
        {/* {Meta(post)} */}
      </Head>
      <div className="flex flex-col min-h-screen w-screen max-w-full items-center">
        <IntraNav />
        <main className="flex flex-col flex-1 bg-black text-white layout pb-12 md:pb-16 layout-px">
          <article className="layout-narrow space-y-4 mt-4 lg:mt-8 xl:mt-12">
            <h1 className="text-4xl mb-5 md:mb-[1.5625rem] 3xl:mb-[1.875rem]">
              Information
            </h1>
            <p>
              Urbit is a new computing paradigm that provides complete ownership
              of your digital world. We envision replacing the "ball of mud of
              conventional software with an entirely new software stack.
            </p>
            <p>
              Urbit is a deterministic, transactional operating system and
              network predicated on a lifecycle function and a simple RISC-like
              combinator calculus. We are building a world for personal
              computational sovereignty: decentralized peer-to-peer
              applications, cryptographic identity, and designed to last
              forever. But the work isn't done yet, and we are meeting
              compelling and novel challenges in solid-state computing head-on.
            </p>
            <p>
              The Urbit Systems Technical Journal publishes articles on the
              ongoing development of Urbit and on solid-state computing more
              generally. Like the famous Bell Labs Technical Journal on which it
              is modeled, the Urbit Systems Technical Journal aims to document
              the engineering work necessary to realize the vision of computing
              as sovereign, deterministic, and grounded on solid first
              principles.
            </p>
            <p>
              In so doing, we hope that these technical problems come to
              interest and benefit the broader developer community. Functional
              (as in programming) engineers are often on the leading edge of
              software development, and the solutions they undertake have
              required large-scale innovations in the field of computer science
              generally.
            </p>
            <p>
              Urbit is currently engaged in such endeavors, such as the Ares
              project to increase data storage and execution speed of Urbit's
              low-level interpreted language Nock. This issue of USTJ showcases
              advancements in dynamic linking, floating-point calculation, and
              memory management systems. We welcome submissions from those
              engaged in making computing more solid-state.
            </p>
            <p>
              Urbit's network is already fully operational and free to use and
              build on. Scan the QR code below to boot up your own and give it a
              spin.
            </p>
          </article>
        </main>
      </div>
    </>
  );
}
