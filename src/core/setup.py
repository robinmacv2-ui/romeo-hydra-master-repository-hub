from setuptools import setup, find_packages

setup(
    name="romeo-hydra",
    version="0.1.2",
    description="Motor de gobernanza ciberfisica de caja blanca - determinista y evidencial",
    long_description="Framework de inferencia logica convexa con trazabilidad WORM-ready y auditabilidad forense.",
    author="Luis Angel Vazquez Martinez",
    license="AGPL-3.0-only",
    packages=find_packages(),
    python_requires=">=3.8",
    install_requires=[
        "pydantic>=2.0.0",
        "colorama>=0.4.6",
    ],
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Financial and Operational Governance",
        "License :: OSI Approved :: GNU Affero General Public License v3 (AGPLv3)",
        "Programming Language :: Python :: 3.11",
        "Operating System :: OS Independent",
    ],
    keywords="regtech governance deterministic-inference auditability",
    project_urls={
        "Source": "https://github.com/romeo-hydra/core",
    },
)
